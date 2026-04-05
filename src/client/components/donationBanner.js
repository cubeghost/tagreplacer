import React from 'react';
import PropTypes from 'prop-types';

const FLAG_LABELS = {
  '🇵🇸': 'Palestine',
  '🇱🇧': 'Lebanon',
  '🇸🇩': 'Sudan',
};
const DonationLink = ({href, flags, children}) => {
  const flagsArray = Array.isArray(flags) ? flags : [flags];
  const flagsLabel = `${flagsArray.length > 1 ? 'Flags' : 'Flag'} of ${flagsArray.map(flag => FLAG_LABELS[flag]).join(' and ')}`;

  return (
    <li>
      <span role="img" aria-label={flagsLabel}>
        {flagsArray.join('')}
      </span>
      <a href={href} target="_blank" rel="noreferrer noopener">{children}</a>
    </li>
  );
};
DonationLink.propTypes = {
  href: PropTypes.string,
  flags: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  children: PropTypes.node,
};

const DonationBanner = () => (
  <ul className="donation-banner">
    <DonationLink flags="🇵🇸" href="https://chuffed.org/project/bridgeofsolidarity">bridge of solidarity</DonationLink>
    <DonationLink flags="🇱🇧" href="https://chuffed.org/project/lebanonsolidarity">lebanon solidarity collective</DonationLink>
    <DonationLink flags={['🇸🇩', '🇵🇸']} href="https://chuffed.org/project/126887-abu-hureirah-aid-network">abu hureirah aid network</DonationLink>
    <DonationLink flags="🇵🇸" href="https://chuffed.org/project/hope-giving-circle">hope giving circle</DonationLink>
    <DonationLink flags="🇵🇸" href="https://linktr.ee/thesameerproject">sameer project</DonationLink>
    <DonationLink flags="🇵🇸" href="https://gazafunds.com/">gazafunds.com</DonationLink>
  </ul>
);

export default DonationBanner;