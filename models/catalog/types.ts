/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeclarativeShapeCommand, PaletteEntry, AnimatedEntityDescriptor } from '../declarativeTypes';

export interface CatalogAssetRecipe {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  palette: Record<string, PaletteEntry>;
  commands: DeclarativeShapeCommand[];
  animatedEntities?: AnimatedEntityDescriptor[];
}
