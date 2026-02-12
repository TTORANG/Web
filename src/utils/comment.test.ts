import { describe, expect, it } from 'vitest';

import type { Comment } from '@/types/comment';

import { countTreeComments, deleteFromFlat, flatToTree, updateInFlat } from './comment';

const makeComment = (id: string, parentId?: string): Comment => ({
  commentId: id,
  userId: 'u1',
  content: `Comment ${id}`,
  createdAt: '2024-01-01',
  isMine: false,
  parentId,
});

describe('updateInFlat', () => {
  it('updates the content of the target comment', () => {
    const comments = [makeComment('1'), makeComment('2')];
    const result = updateInFlat(comments, '1', 'Updated');
    expect(result[0].content).toBe('Updated');
    expect(result[1].content).toBe('Comment 2');
  });

  it('returns a new array (immutability)', () => {
    const comments = [makeComment('1')];
    const result = updateInFlat(comments, '1', 'New');
    expect(result).not.toBe(comments);
    expect(result[0]).not.toBe(comments[0]);
  });

  it('leaves array unchanged when target not found', () => {
    const comments = [makeComment('1')];
    const result = updateInFlat(comments, 'nonexistent', 'New');
    expect(result[0].content).toBe('Comment 1');
  });
});

describe('deleteFromFlat', () => {
  it('deletes the target comment', () => {
    const comments = [makeComment('1'), makeComment('2')];
    const result = deleteFromFlat(comments, '1');
    expect(result).toHaveLength(1);
    expect(result[0].commentId).toBe('2');
  });

  it('cascading deletes children', () => {
    const comments = [makeComment('1'), makeComment('2', '1'), makeComment('3', '2')];
    const result = deleteFromFlat(comments, '1');
    expect(result).toHaveLength(0);
  });

  it('only deletes target subtree', () => {
    const comments = [makeComment('1'), makeComment('2', '1'), makeComment('3')];
    const result = deleteFromFlat(comments, '1');
    expect(result).toHaveLength(1);
    expect(result[0].commentId).toBe('3');
  });
});

describe('flatToTree', () => {
  it('converts flat comments to tree structure', () => {
    const comments = [makeComment('1'), makeComment('2', '1'), makeComment('3', '1')];
    const tree = flatToTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].replies).toHaveLength(2);
  });

  it('handles multiple root comments', () => {
    const comments = [makeComment('1'), makeComment('2')];
    const tree = flatToTree(comments);
    expect(tree).toHaveLength(2);
  });

  it('handles empty array', () => {
    expect(flatToTree([])).toHaveLength(0);
  });

  it('initializes replies as empty arrays', () => {
    const tree = flatToTree([makeComment('1')]);
    expect(tree[0].replies).toEqual([]);
  });
});

describe('countTreeComments', () => {
  it('counts all comments recursively', () => {
    const tree = flatToTree([makeComment('1'), makeComment('2', '1'), makeComment('3', '2')]);
    expect(countTreeComments(tree)).toBe(3);
  });

  it('returns 0 for empty array', () => {
    expect(countTreeComments([])).toBe(0);
  });
});
