/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box } from 'lucide-react';
import { Text } from '../ui/typography/Typography';

export const LibraryEmptyState: React.FC = () => {
  return (
    <div className="py-12 text-center text-slate-400">
      <Box size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
      <Text variant="subheading" className="text-slate-600">No matching models found</Text>
      <Text variant="caption" className="mt-1 block">Try a different search term or category filter</Text>
    </div>
  );
};
