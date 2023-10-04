/* global describe, it */

const { expect } = require('chai');

const Tags = require('../tags');

describe('Tags.replace', function() {
  it('can replace 1 tag with 1 tag', function() {
    const result = new Tags().replace({
      tags: ['cat', 'dog'],
      find: ['cat'],
      replace: ['mouse']
    });

    expect(result).to.deep.equal(['mouse', 'dog']);
  });

  it('can replace 1 tag with 2 tags, preserving original order', function() {
    const result = new Tags().replace({
      tags: ['cat', 'dog'],
      find: ['cat'],
      replace: ['mouse', 'hamster']
    });

    expect(result).to.deep.equal(['mouse', 'dog', 'hamster']);
  });

  it('can append tags (replace 1 tag with itself and another tag)', function() {
    const result = new Tags().replace({
      tags: ['cat', 'dog', 'bird'],
      find: ['dog'],
      replace: ['dog', 'hamster']
    });

    expect(result).to.deep.equal(['cat', 'dog', 'bird', 'hamster']);
  });

  it('can remove a tag (replace 1 tag with 0 tags)', function() {
    const result = new Tags({
      allowDelete: true,
    }).replace({
      tags: ['cat', 'dog', 'bird'],
      find: ['dog'],
      replace: [],
    });

    expect(result).to.deep.equal(['cat', 'bird']);
  });

  it('can remove multiple tags (replace 2+ tags with 0 tags)', function() {
    const result = new Tags({
      allowDelete: true,
    }).replace({
      tags: ['cat', 'dog', 'bird'],
      find: ['cat', 'dog'],
      replace: [],
    });

    expect(result).to.deep.equal(['bird']);
  });

  it('can find tags case-insensitively', function() {
    const result = new Tags({
      caseSensitive: false,
    }).replace({
      tags: ['cat', 'Dog'],
      find: ['Cat'],
      replace: ['Mouse'],
    });

    expect(result).to.deep.equal(['Mouse', 'Dog']);
  });

  it('can find tags case-sensitively', function() {
    const result = new Tags({
      caseSensitive: true,
    }).replace({
      tags: ['cat', 'Cat', 'Dog'],
      find: ['Cat'],
      replace: ['Mouse'],
    });

    expect(result).to.deep.equal(['cat', 'Mouse', 'Dog']);
  });
});
