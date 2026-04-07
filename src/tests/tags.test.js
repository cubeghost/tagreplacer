/* global describe, it */

import { expect } from 'chai';

import { replaceTags } from "../tags.mjs";

describe('Tags.replace', function() {
  it('can replace 1 tag with 1 tag', function() {
    const result = replaceTags({
      tags: ['cat', 'dog'],
      find: ['cat'],
      replace: ['mouse']
    });

    expect(result).to.deep.equal(['mouse', 'dog']);
  });

  it('can replace 1 tag with 2 tags, preserving original order', function() {
    const result = replaceTags({
      tags: ['cat', 'dog'],
      find: ['cat'],
      replace: ['mouse', 'hamster']
    });

    expect(result).to.deep.equal(['mouse', 'dog', 'hamster']);
  });

  it('can append tags (replace 1 tag with itself and another tag)', function() {
    const result = replaceTags({
      tags: ['cat', 'dog', 'bird'],
      find: ['dog'],
      replace: ['dog', 'hamster']
    });

    expect(result).to.deep.equal(['cat', 'dog', 'bird', 'hamster']);
  });

  it('can append tags, preserving existing tags', function() {
    const result = replaceTags({
      tags: ['cat', 'dog', 'bird', 'pet'],
      find: ['cat'],
      replace: ['cat', 'pet']
    });

    expect(result).to.deep.equal(['cat', 'dog', 'bird', 'pet']);
  });

  it('can remove a tag (replace 1 tag with 0 tags)', function() {
    const result = replaceTags({
      tags: ['cat', 'dog', 'bird'],
      find: ['dog'],
      replace: [],
    }, {
      allowDelete: true
    });

    expect(result).to.deep.equal(['cat', 'bird']);
  });

  it('can remove multiple tags (replace 2+ tags with 0 tags)', function() {
    const result = replaceTags({
      tags: ['cat', 'dog', 'bird'],
      find: ['cat', 'dog'],
      replace: [],
    }, {
      allowDelete: true,
    })

    expect(result).to.deep.equal(['bird']);
  });

  it('can find tags case-insensitively', function() {
    const result = replaceTags({
      tags: ['cat', 'Dog'],
      find: ['Cat'],
      replace: ['Mouse'],
    }, {
      caseSensitive: false,
    });

    expect(result).to.deep.equal(['Mouse', 'Dog']);
  });

  it('can find tags case-sensitively', function() {
    const result = replaceTags({
      tags: ['cat', 'Cat', 'Dog'],
      find: ['Cat'],
      replace: ['Mouse'],
    }, {
      caseSensitive: true,
    });

    expect(result).to.deep.equal(['cat', 'Mouse', 'Dog']);
  });
});
