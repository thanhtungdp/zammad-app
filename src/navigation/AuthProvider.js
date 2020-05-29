import React, {createContext, useState} from 'react';
import {ZammadApi, User} from 'zammad-js-api';
import * as url from "url";

/**
 * Provide auth information in whole app
 */
export const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: async (host, email, password, savePassword = false) => {
          /** Host URL sanity checking */
          //we do require a leading slash for the ZammadApi
          if(!/\/$/.test(host)){
            host = String(host) + "/";
          }
          //try parsing or throw error otherwise
          let hostUrl = url.parse(host);

          let api = new ZammadApi(hostUrl.href, email, password);
          let user = await User.getAuthenticated(api);

          setUser({api, user});
          Auth.notifyAuthStateChanged({api, user});
        },
        logout: async () => {
          setUser(null);
          Auth.notifyAuthStateChanged();
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export class Auth {
  /**
   * Add an observer for listening to auth
   * state changes
   * @param {*} observer Observer function
   * @return Unsubscribe function for observers
   */
  static onAuthStateChanged(observer) {
    if (!this.authStateChangedObservers) {
      this.authStateChangedObservers = [];
    }

    this.authStateChangedObservers.push(observer);

    return () => {
      const index = this.authStateChangedObservers.indexOf(observer);
      if (index > -1) {
        this.authStateChangedObservers.splice(index, 1);
      }
    };
  }

  /**
   * Call this method whenever the auth state changes
   * in order to notify any observers
   */
  static notifyAuthStateChanged(param = null) {
    if (this.authStateChangedObservers) {
      this.authStateChangedObservers.forEach(obs => obs(param));
    }
  }
}
