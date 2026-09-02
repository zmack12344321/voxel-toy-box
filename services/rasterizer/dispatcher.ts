/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Command dispatcher — routes DeclarativeShapeCommand to specialized handler modules.
 */

import { DeclarativeShapeCommand } from '../../models/declarativeTypes';
import type { SceneWater } from '../../types';
import { RasterizerState } from './helpers';
import { handleBasicCommand } from './handlers/basicHandlers';
import { handleEnvironmentCommand } from './handlers/environmentHandlers';
import { handleComplexCommand } from './handlers/complexHandlers';

export function executeCommand(
  state: RasterizerState,
  cmd: DeclarativeShapeCommand,
  waterRef: { value: SceneWater | null },
  self: { executeCommand: (cmd: DeclarativeShapeCommand) => void }
): { water: SceneWater | null } {
  if (handleBasicCommand(state, cmd)) {
    return { water: null };
  }

  const envResult = handleEnvironmentCommand(state, cmd, waterRef, self);
  if (envResult.handled) {
    return { water: envResult.water ?? null };
  }

  handleComplexCommand(state, cmd, self);
  return { water: null };
}
