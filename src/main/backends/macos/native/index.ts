//////////////////////////////////////////////////////////////////////////////////////////
//   _  _ ____ _  _ ___  ____                                                           //
//   |_/  |__| |\ | |  \ |  |    This file belongs to Kando, the cross-platform         //
//   | \_ |  | | \| |__/ |__|    pie menu. Read more on github.com/kando-menu/kando     //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

export interface Native {
  /**
   * This simulates a mouse movement.
   *
   * @param dx The horizontal movement in pixels.
   * @param dy The vertical movement in pixels.
   */
  movePointer(dx: number, dy: number): void;

  /**
   * This simulates a key press or release.
   *
   * @param keycode The X11 scan code to simulate.
   * @param down If true, a key press is simulated. Otherwise, a key release is simulated.
   */
  simulateKey(keycode: number, down: boolean): void;

  /**
   * This retrieves the app and class of the currently focused window.
   *
   * @returns The app and class of the currently focused window.
   */
  getActiveWindow(): { app: string; name: string };

  /** This gives input focus to the topmost window after Kando has been closed. */
  restoreFocus(): void;
}

const native: Native = require('./../../../../../build/Release/NativeMacOS.node');

export { native };
