//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

import { native } from './native';
import { Backend, Shortcut, WMInfo } from '../../backend';
import { IKeySequence } from '../../../../common';
import { LinuxKeyCodes } from '../keys';

/**
 * This is a partial implementation of the Backend interface for wlroots-based Wayland
 * compositors. It can be used as a base class for other wlroots-based backends. It
 * provides the following functionality:
 *
 * - Moving the mouse pointer using the wlr-virtual-pointer-unstable-v1 protocol.
 * - Sending key input using the virtual-keyboard-unstable-v1 protocol.
 */
export abstract class WLRBackend implements Backend {
  /**
   * Moves the pointer by the given amount using the native module which uses the
   * wlr-virtual-pointer-unstable-v1 Wayland protocol.
   *
   * @param dx The amount of horizontal movement.
   * @param dy The amount of vertical movement.
   */
  public async movePointer(dx: number, dy: number) {
    try {
      native.movePointer(dx, dy);
    } catch (e) {
      console.error('Failed to move mouse pointer: ' + e.message);
    }
  }

  /**
   * This simulates a key sequence by sending the keys to the currently focused window
   * using the virtual-keyboard-unstable-v1 Wayland protocol. If one of the given keys in
   * the sequence is not known, an exception will be thrown.
   *
   * @param shortcut The keys to simulate.
   */
  public async simulateKeys(keys: IKeySequence) {
    // We first need to convert the given DOM key names to X11 key codes. If a key code is
    // not found, we throw an error.
    const keyCodes = keys.map((key) => {
      const code = LinuxKeyCodes.get(key.name);

      if (code === undefined) {
        throw new Error(`Unknown key: ${key.name}`);
      }

      return code;
    });

    // Now simulate the key presses. We wait a couple of milliseconds if the key has a
    // delay specified.
    for (let i = 0; i < keyCodes.length; i++) {
      if (keys[i].delay > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, keys[i].delay);
        });
      }

      native.simulateKey(keyCodes[i], keys[i].down);
    }
  }

  /**
   * On Wayland, the window which had focus before the pie menu was opened will usually
   * regain focus automatically. So this method does nothing.
   */
  public async restoreFocus() {}

  // These methods are abstract and need to be implemented by subclasses. See the docs
  // of the methods in the Backend interface for more information.
  abstract init(): Promise<void>;
  abstract getWindowType(): string;
  abstract getWMInfo(): Promise<WMInfo>;
  abstract bindShortcut(shortcut: Shortcut): Promise<void>;
  abstract unbindShortcut(shortcut: Shortcut): Promise<void>;
  abstract unbindAllShortcuts(): Promise<void>;
}
