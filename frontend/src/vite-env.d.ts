/// <reference types="vite/client" />

interface Window {
  turnstile?: {
    render: (container: HTMLElement, options: { sitekey: string; callback?: (token: string) => void }) => string;
    remove: (widgetId: string) => void;
    getResponse: (widgetId: string) => string;
  };
}

declare namespace google {
  namespace accounts.oauth2 {
    interface TokenResponse {
      access_token?: string;
      error?: string;
    }
    interface TokenClient {
      callback: (response: TokenResponse) => void;
      requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
    }
    function initTokenClient(config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
    }): TokenClient;
  }

  namespace picker {
    enum ViewId {
      SPREADSHEETS = 'SPREADSHEETS',
    }
    enum Action {
      PICKED = 'picked',
      CANCEL = 'cancel',
    }
    interface DocumentObject {
      id?: string;
      name?: string;
    }
    interface ResponseObject {
      action?: Action;
      docs?: DocumentObject[];
    }
    class DocsView {
      constructor(viewId?: ViewId);
      setIncludeFolders(value: boolean): DocsView;
      setSelectFolderEnabled(value: boolean): DocsView;
    }
    class PickerBuilder {
      setDeveloperKey(key: string): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      addView(view: DocsView): PickerBuilder;
      setCallback(callback: (data: ResponseObject) => void): PickerBuilder;
      build(): { setVisible: (visible: boolean) => void };
    }
  }
}

declare const gapi: {
  load: (apiName: string, callback: () => void) => void;
};
