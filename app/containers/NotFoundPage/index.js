/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 *
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

export default function NotFound() {
  return (
    <React.Fragment>
      <Helmet>
        <title>Questioner</title>
        <meta name="description" content="page not found" />
      </Helmet>
      <h1>
        <FormattedMessage {...messages.header} />
      </h1>
    </React.Fragment>
  );
}
