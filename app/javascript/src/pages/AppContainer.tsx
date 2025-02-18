import React from 'react';

import { Switch, Route, withRouter, Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import Dashboard from './Dashboard';
import Platform from './Platform';
import Conversations from './Conversations';
import Settings from './Settings';
import AppSettings from './AppSettings';
import MessengerSettings from './MessengerSettings';
import Team from './Team';
import Webhooks from './Webhooks';
import Integrations from './Integrations';
import Articles from './Articles';
import Bots from './Bots';
import Campaigns from './Campaigns';
import Profile from './Profile';
import AgentProfile from './AgentProfile';
import Billing from './Billing';
import Api from './Api';
import Reports from './Reports';

import { connect } from 'react-redux';

import UpgradePage from './UpgradePage';
// import Pricing from '../pages/pricingPage'

import CampaignHome from './campaigns/home';
import Progress from '@chaskiq/components/src/components/Progress';
import UserSlide from '@chaskiq/components/src/components/UserSlide';
import Connectivity from '@chaskiq/components/src/components/connectivity';

import { toggleDrawer } from '@chaskiq/store/src/actions/drawer';
import { getCurrentUser } from '@chaskiq/store/src/actions/current_user';
import { updateAppUserPresence } from '@chaskiq/store/src/actions/app_users';
import { setApp } from '@chaskiq/store/src/actions/app';

import UserProfileCard from '@chaskiq/components/src/components/UserProfileCard';
import LoadingView from '@chaskiq/components/src/components/loadingView';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';
import RestrictedArea, {
  allowedAccessTo,
} from '@chaskiq/components/src/components/AccessDenied';

import Notifications from '@chaskiq/components/src/components/notifications';

import Sidebar from '../layout/sidebar';
import PackageSlider from '../pages/conversations/packageSlider';

import {
  createSubscription,
  destroySubscription,
  eventsSubscriber,
  sendPush,
} from '../shared/actionCableSubscription';
// import {createSubscription, destroySubscription, eventsSubscriber, sendPush } from '../shared/absintheCableSubscription';
import logo from '../images/logo.png';
import layoutDefinitions from '../layout/layoutDefinitions';
import { MainMenuHorizontal } from '../layout/mainMenu';
import { setReconnection } from '@chaskiq/store/src/actions/reconnection';
declare global {
  interface Window {
    chaskiq_cable_url: any;
  }
}

function AppContainer({
  match,
  dispatch,
  isAuthenticated,
  current_user,
  app,
  drawer,
  app_user,
  loading,
  upgradePages,
  accessToken,
  history,
  current_section,
}) {
  const CableApp = React.useRef(createSubscription(match, accessToken));

  const [_subscribed, setSubscribed] = React.useState(null);
  const [reconnectTs, setReconnectTs] = React.useState(0);

  React.useEffect(() => {
    dispatch(getCurrentUser());
    fetchApp(() => {
      eventsSubscriber(
        match.params.appId,
        CableApp.current,
        dispatch,
        fetchApp
      );
    });
    return () => {
      console.log('unmounting cable from app container');
      if (CableApp.current) destroySubscription(CableApp.current);
    };
  }, [match.params.appId]);

  const fetchApp = (cb) => {
    const id = match.params.appId;
    dispatch(
      setApp(id, {
        success: () => {
          cb && cb();
        },
      })
    );
  };

  React.useEffect(() => {
    function frameCallbackHandler(event) {
      if (event.data.type !== 'url-push-from-frame') return;
      console.log('HANDLED EVENT FROM FRAME', event.data);
      history.push(event.data.url);
    }

    window.addEventListener('message', frameCallbackHandler);
    return () => window.removeEventListener('message', frameCallbackHandler);
  }, []);

  function updateUser(data) {
    dispatch(updateAppUserPresence(data));
  }

  function handleSidebar() {
    dispatch(toggleDrawer({ open: !drawer.open }));
  }

  function handleUserSidebar() {
    dispatch(toggleDrawer({ userDrawer: !drawer.userDrawer }));
  }

  function pushEvent(name, data) {
    sendPush(name, {
      props: { app },
      events: CableApp.current.events,
      data: data,
    });
  }

  function reconnectHandler() {
    // console.log("RECONNECT HERE")
    dispatch(setReconnection());
  }

  const layout = layoutDefinitions();

  return (
    <React.Fragment>
      {layout.horizontalMenu.display && (
        <MainMenuHorizontal
          current_user={current_user}
          current_section={current_section}
          displayLabel={layout.horizontalMenu.displayLabel}
          app={app}
        />
      )}

      <div
        className={` m-generalTop h-generalHeight flex overflow-hidden bg-white dark:bg-black dark:text-white`}
      >
        {app && <Sidebar />}

        <Connectivity onReconnect={reconnectHandler} />

        {drawer.open && (
          <div
            onClick={handleSidebar}
            style={{
              background: '#000',
              position: 'fixed',
              opacity: 0.7,
              zIndex: 1,
              width: '100vw',
              height: '100vh',
            }}
          />
        )}

        <Notifications history={history} />

        {drawer.userDrawer && (
          <UserSlide open={!!drawer.userDrawer} onClose={handleUserSidebar}>
            {app_user ? <UserProfileCard width={'300px'} /> : <Progress />}
          </UserSlide>
        )}

        {loading || (!app && <LoadingView />)}

        {isAuthenticated && current_user.email && (
          <div className="flex flex-col w-0 flex-1 overflow-auto---">
            <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
              <button
                onClick={handleSidebar}
                className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-150"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {!isEmpty(upgradePages) && <UpgradePage page={upgradePages} />}

            {app && isEmpty(upgradePages) && (
              <ErrorBoundary variant={'very-wrong'}>
                <Switch>
                  <Route path={`${match.url}/`} exact>
                    <Dashboard />
                  </Route>

                  <Route exact path={`${match.path}/segments/:segmentID/:Jwt?`}>
                    <RestrictedArea section="segments">
                      <Platform />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/settings`}>
                    <Settings />
                  </Route>

                  <Route path={`${match.url}/app_settings`}>
                    <RestrictedArea section="app_settings">
                      <AppSettings />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/messenger`}>
                    <RestrictedArea section="messenger_settings">
                      <MessengerSettings />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/team`}>
                    <RestrictedArea section="team">
                      <Team />
                    </RestrictedArea>
                  </Route>

                  <Route
                    exact
                    path={`${match.path}/users/:id`}
                    render={(props) => <Profile {...props} />}
                  />

                  <Route
                    exact
                    path={`${match.path}/agents/:id`}
                    render={(props) => <AgentProfile {...props} />}
                  />

                  <Route path={`${match.url}/webhooks`}>
                    <RestrictedArea section="outgoing_webhooks">
                      <Webhooks />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/integrations`}>
                    <RestrictedArea section="app_packages">
                      <Integrations />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/reports`}>
                    <RestrictedArea section="reports">
                      <Reports />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/articles`}>
                    <RestrictedArea section="help_center">
                      <Articles />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/conversations`}>
                    <RestrictedArea section="conversations">
                      <Conversations
                        subscribed
                        pushEvent={pushEvent}
                        events={CableApp.current.events}
                      />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/oauth_applications`}>
                    <RestrictedArea section="oauth_applications">
                      <Api />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/billing`}>
                    <RestrictedArea section="billing">
                      <Billing />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/bots`}>
                    <RestrictedArea section="routing_bots">
                      <Bots />
                    </RestrictedArea>
                  </Route>

                  <Route path={`${match.url}/campaigns`}>
                    <CampaignHome />
                  </Route>

                  <Route path={`${match.path}/messages/:message_type`}>
                    <RestrictedArea section="campaigns">
                      <Campaigns />
                    </RestrictedArea>
                  </Route>
                </Switch>
              </ErrorBoundary>
            )}
          </div>
        )}
        {app && allowedAccessTo(app, 'fixed_app_packages') && <PackageSlider />}
      </div>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const {
    auth,
    drawer,
    app,
    segment,
    app_user,
    app_users,
    current_user,
    navigation,
    paddleSubscription,
    upgradePages,
    fixedSlider,
    notifications,
  } = state;
  const { loading, isAuthenticated, accessToken } = auth;
  const { current_section } = navigation;
  return {
    segment,
    app_users,
    app_user,
    current_user,
    app,
    loading,
    isAuthenticated,
    current_section,
    drawer,
    paddleSubscription,
    upgradePages,
    accessToken,
    fixedSlider,
  };
}

export default withRouter(connect(mapStateToProps)(AppContainer));
