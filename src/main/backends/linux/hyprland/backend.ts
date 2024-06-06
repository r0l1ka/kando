//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

import { exec } from 'child_process';
import { WLRBackend } from '../wlroots/backend';
import { native } from './native';
import { Shortcut } from '../../backend';

/**
 * This backend is used on Hyprland. It uses the generic wlroots backend and adds the
 * missing functionality using the hyprctl command line utility and the
 * hyprland-global-shortcuts-v1 Wayland protocol.
 */
export class HyprBackend extends WLRBackend {
  /**
   * This is called when the backend is created. We use it to print a warning, as the user
   * still needs to set up some window rules and bind the shortcuts.
   */
  public async init() {
    console.log(
      `
The Hyprland backend is still a bit experimental!
You have to perform some manual steps to make Kando work properly.
See https://github.com/kando-menu/kando/blob/main/docs/installing.md#platform-specific-notes
for more information.
`
    );
  }

  /**
   * 'splash' seems to be a good choice for Hyprland. See:
   * https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions
   */
  public getBackendInfo() {
    return {
      windowType: 'splash',
      supportsShortcuts: false,
      shortcutHint: 'Use your hyprland.conf to bind this.',
    };
  }

  /**
   * This uses the hyprctl commandline tool to get the current pointer position relative
   * to the currently focused monitor as well as name and app of the currently focused
   * window.
   *
   * @returns The name and app of the currently focused window as well as the current
   *   pointer position.
   */
  public async getWMInfo() {
    // We need to call hyprctl multiple times to get all the information we need.
    const [activewindow, cursorpos] = await Promise.all([
      this.hyprctl('activewindow'),
      this.hyprctl('cursorpos'),
    ]);

    return {
      windowName: activewindow['initialTitle'] || '',
      appName: activewindow['initialClass'] || '',
      pointerX: cursorpos['x'],
      pointerY: cursorpos['y'],
    };
  }

  /**
   * This binds a shortcut. The action callback of the shortcut is called when the
   * shortcut is pressed.
   *
   * @param shortcut The shortcut to bind.
   */
  public async bindShortcut(shortcut: Shortcut) {
    native.bindShortcut(shortcut);
  }

  /**
   * This unbinds a previously bound shortcut.
   *
   * @param shortcut The shortcut to unbind.
   */
  public async unbindShortcut(shortcut: Shortcut) {
    native.unbindShortcut(shortcut);
  }

  /** This unbinds all previously bound shortcuts. */
  public async unbindAllShortcuts() {
    native.unbindAllShortcuts();
  }

  /**
   * This uses the hyprctl command line tool to execute a command and parse its JSON
   * output.
   *
   * @param command One of the hyprctl subcommands.
   * @returns A promise which resolves to the parsed JSON output of hyprctl.
   */
  private async hyprctl(command: string): Promise<never> {
    return new Promise((resolve, reject) => {
      exec(`hyprctl -j ${command}`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(JSON.parse(stdout));
      });
    });
  }
}
