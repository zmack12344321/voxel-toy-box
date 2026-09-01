/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CATALOG_RECIPES } from '../../models/catalog/recipes';
import { CatalogAssetRecipe } from '../../models/catalog/types';

export class CatalogRetriever {
  /**
   * Evaluates prompt text against catalog recipe tags, names, and descriptions,
   * returning the top matching recipes to format as few-shot prompt examples.
   */
  public static findRelevantRecipes(prompt: string, maxResults = 4): CatalogAssetRecipe[] {
    if (!prompt || typeof prompt !== 'string') {
      return CATALOG_RECIPES.slice(0, maxResults);
    }

    const cleanPrompt = prompt.toLowerCase();
    const words = cleanPrompt.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);

    const scored = CATALOG_RECIPES.map(recipe => {
      let score = 0;

      // Match against name
      const nameLower = recipe.name.toLowerCase();
      if (cleanPrompt.includes(nameLower)) score += 10;

      // Match against category
      if (cleanPrompt.includes(recipe.category)) score += 5;

      // Match against tags
      for (const tag of recipe.tags) {
        const tagLower = tag.toLowerCase();
        if (cleanPrompt.includes(tagLower)) {
          score += 4;
        } else {
          for (const w of words) {
            if (tagLower.includes(w) || w.includes(tagLower)) {
              score += 2;
            }
          }
        }
      }

      // Match against description words
      const descLower = recipe.description.toLowerCase();
      for (const w of words) {
        if (descLower.includes(w)) score += 1;
      }

      return { recipe, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Filter positive matches or fallback to top general recipes
    const matches = scored.filter(s => s.score > 0).map(s => s.recipe);
    if (matches.length === 0) {
      return CATALOG_RECIPES.slice(0, maxResults);
    }

    return matches.slice(0, maxResults);
  }

  /**
   * Formats recipes into a clean JSON array string for LLM system prompt injection.
   */
  public static formatRecipesForPrompt(recipes: CatalogAssetRecipe[]): string {
    return JSON.stringify(
      recipes.map(r => ({
        name: r.name,
        palette: r.palette,
        commands: r.commands
      })),
      null,
      2
    );
  }
}
