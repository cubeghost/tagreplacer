import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';

import Post from './Post';
import { formatTags } from '../util';

const PUBLISHED_STATES = ['published', 'private'];

const Results = () => {
  const { includeQueue, includeDrafts } = useSelector(state => state.options, shallowEqual);
  const find = useSelector(state => state.tumblr.find);
  const posts = useSelector(state => state.tumblr.posts, shallowEqual);

  const published = useMemo(() => posts?.filter(post => PUBLISHED_STATES.includes(post.state)), [posts]);
  const queued = useMemo(() => posts?.filter(post => post.state === 'queued'), [posts]);
  const drafts = useMemo(() => posts?.filter(post => post.state === 'draft'), [posts]);

  if (posts) {
    const results = [
      (
        <div key="posts">
          <h2>
            found {published.length} posts tagged {formatTags(find)}
          </h2>
          {published.map(result => (
            <Post {...result} key={`result-${name}-${result.id}`} />
          ))}
        </div>
      )
    ];

    if (includeQueue) {
      results.push(
        <div key="queue">
          <h2>
            found {queued.length} queued posts tagged {formatTags(find)}
          </h2>
          {queued.map(result => (
            <Post {...result} key={`result-${name}-${result.id}`} />
          ))}
        </div>
      )
    }

    if (includeDrafts) {
      results.push(
        <div key="drafts">
          <h2>
            found {drafts.length} drafts tagged {formatTags(find)}
          </h2>
          {drafts.map(result => (
            <Post {...result} key={`result-${name}-${result.id}`} />
          ))}
        </div>
      )
    }

    return results;
  } else {
    return null;
  }
};


export default React.memo(Results);
