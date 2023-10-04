import React from 'react';
import { useSelector } from 'react-redux';

import { formatTags } from '../util';
import { useStep } from '../steps';
import countBy from 'lodash/countBy';

const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

const ResultsHeader = () => {
  const step = useStep();
  const { includeQueue, includeDrafts } = useSelector(state => state.options);
  const { blog, find, replace } = useSelector(state => state.form);

  const separatePostCounts = includeQueue || includeDrafts;
  const postCounts = useSelector((state) => {
    const posts = Object.values(state.posts.entities);
    const counts = countBy(posts, (post) => {
      if (post.state === 'published' || post.state === 'private') {
        return 'published';
      } else {
        return post.state;
      }
    });

    return {
      total: posts.length,
      published: counts.published || 0,
      queued: counts.queued || 0,
      draft: counts.draft || 0,
    };
  });
  const hasFound = step.index > 0;
  const isPreviewReplace = step.key === 'replace';
  const isReplaced = step.key === 'replaced';

  return (
    <div className="section sticky" style={{ top: "1rem" }}>
      {hasFound && (
        <div>
          found{" "}
          {separatePostCounts ? listFormatter.format([
            `${postCounts.published} published`,
            includeQueue && `${postCounts.queued} queued`,
            includeDrafts && `${postCounts.draft} drafted`
          ].filter(Boolean)) : postCounts.total} posts for{" "}
          <a
            href={`https://${blog}.tumblr.com/tagged/${find}`}
            className="external-link"
          >
            {formatTags(find)}
          </a>
        </div>
      )}
      {isPreviewReplace && (
        <div>
          <br />
          replacing with{" "}
          <a
            href={`https://${blog}.tumblr.com/tagged/${replace}`}
            className="external-link"
          >
            {formatTags(replace)}
          </a>{" "}
          (preview)
        </div>
      )}
      {isReplaced && (
        <div>
          <br />
          replaced with{" "}
          <a
            href={`https://${blog}.tumblr.com/tagged/${replace}`}
            className="external-link"
          >
            {formatTags(replace)}
          </a>{" "}
        </div>
      )}
    </div>
  );
};

export default React.memo(ResultsHeader);