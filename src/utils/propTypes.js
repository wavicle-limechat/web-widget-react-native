import PropTypes from 'prop-types';

export const userPropType = PropTypes.shape({
  name: PropTypes.string,
  email: PropTypes.string,
  phone_number: PropTypes.string,
  identifier: PropTypes.string,
  identifier_hash: PropTypes.string,
  custom_attributes: PropTypes.object,
});
