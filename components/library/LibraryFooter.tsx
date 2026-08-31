/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Text } from '../ui/typography/Typography';

interface LibraryFooterProps {
  totalCount: number;
}

export const LibraryFooter: React.FC<LibraryFooterProps> = ({ totalCount }) => {
  return (
    <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center">
      <Text variant="label">
        {totalCount} {totalCount === 1 ? 'model' : 'models'}
      </Text>
    </div>
  );
};
