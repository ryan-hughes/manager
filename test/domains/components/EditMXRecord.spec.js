import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditMXRecord from '~/domains/components/EditMXRecord';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';


describe('domains/components/EditMXRecord', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders fields correctly', () => {
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const page = mount(
      <EditMXRecord
        dispatch={() => {}}
        zone={currentZone}
        id={currentRecord.id}
        close={() => {}}
      />
    );

    const nameserver = page.find('#mailserver');
    expect(nameserver.props().value).to.equal(currentRecord.target);

    const subdomain = page.find('#subdomain');
    expect(subdomain.props().value).to.equal(currentRecord.name || currentZone.domain);

    const ttl = page.find('#preference');
    expect(+ttl.props().value).to.equal(currentRecord.priority);
  });

  it('submits data onsubmit and closes modal', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const currentRecord = currentZone._records.records[4];
    const close = sandbox.spy();
    const page = mount(
      <EditMXRecord
        dispatch={dispatch}
        zone={currentZone}
        id={currentRecord.id}
        close={close}
      />
    );

    changeInput(page, 'mailserver', 'mx1.tester1234.com');
    changeInput(page, 'subdomain', 'tester1234.com');
    changeInput(page, 'preference', 1);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/${currentRecord.id}`, {
        method: 'PUT',
        body: {
          target: 'mx1.tester1234.com',
          name: 'tester1234.com',
          priority: 1,
          type: 'MX',
        },
      }),
    ], 1);

    expect(close.callCount).to.equal(1);
  });

  it('creates a new MX record and closes the modal', async () => {
    const dispatch = sandbox.stub();
    const currentZone = api.domains.domains['1'];
    const close = sandbox.spy();
    const page = mount(
      <EditMXRecord
        dispatch={dispatch}
        zone={currentZone}
        close={close}
      />
    );

    changeInput(page, 'mailserver', 'mx1.tester1234.com');
    changeInput(page, 'subdomain', 'tester1234.com');
    changeInput(page, 'preference', 1);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/domains/${currentZone.id}/records/`, {
        method: 'POST',
        body: {
          target: 'mx1.tester1234.com',
          name: 'tester1234.com',
          priority: 1,
          type: 'MX',
        },
      }),
    ]);

    expect(close.callCount).to.equal(1);
  });
});
