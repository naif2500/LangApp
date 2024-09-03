import React from 'react';
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import Link from 'next/link';

import Highlight from '../../components/Highlight';

export default withPageAuthRequired(
  async function SSRPage() {
    const { user } = await getSession();
    return (
      <>
        <div className="mb-5 mt-5" data-testid="ssr">
          <h1 data-testid="ssr-title ">Account info</h1>
          <div data-testid="ssr-text">
            <p>
             Contact support to delete or change account details.  <Link href="mailto:souf25za@outlook.dk" className="text-gray-800 hover:text-gray-300 ">
              <i className="fas fa-envelope mr-2"></i> Contact here
            </Link>{' '}
            </p>
          </div>
        </div>
        <div className="result-block-container" data-testid="ssr-json">
          <div className="result-block">
            <h6 className="muted">User</h6>
            <Highlight>{JSON.stringify(user, null, 2)}</Highlight>
          </div>
        </div>
      </>
    );
  },
  { returnTo: '/ssr' }
);
