/* eslint-disable no-unused-expressions, arrow-body-style */
const { expect } = require('chai');
const sinon = require('sinon');
const url = require('url');

const makeWSS = require('./core');

const mongoose = require('mongoose');
const Notification = require('../../modules/notification/notification.model');

class Server {
  constructor({ server }) {
    this.server = server;
    this.events = {};

    this.spy = sinon.spy();
  }

  on(...props) {
    this.spy(...props);
  }
}

const WebSocket = {
  Server,
  CONNECTING: 'CONNECTING',
  OPEN: 'OPEN',
  CLOSING: 'CLOSING',
  CLOSED: 'CLOSED',
};

describe('WebSocket Service', () => {
  let debug;
  let WSS;
  let wss;
  let socket;

  beforeEach(() => {
    debug = sinon.spy();
    socket = {
      on: sinon.spy(),
      send: sinon.spy(),
      readyState: WebSocket.OPEN,
    };

    WSS = makeWSS({
      url,
      WebSocket,
      mongoose,
      debug,
      Notification,
    });

    wss = new WSS();
  });

  describe('constructor', () => {
    it('should initialize sockets object', () => {
      expect(wss.sockets).to.deep.equal({});
    });
  });

  describe('addServer', () => {
    it('should create a WebSocket server instance', () => {
      wss.addServer({});

      expect(wss.server).to.be.an.instanceof(Server);
    });

    it('should set onConnection event handler on server', () => {
      wss.addServer({});

      expect(wss.server.spy.getCall(0).args[0]).to.equal('connection');
    });
  });

  describe('addSocket', () => {
    it('should create a socket array if not exists', () => {
      wss.addSocket('id', socket);

      expect(wss.sockets.id).to.be.an.instanceof(Array);
    });

    it('should set onMessage event handler on socket', () => {
      wss.addSocket('id', socket);

      expect(socket.on.getCall(0).args[0]).to.equal('message');
    });

    it('should push socket object into sockets', () => {
      wss.addSocket('id', socket);

      expect(wss.sockets.id).to.have.lengthOf(1);
      expect(wss.sockets.id[0]).to.equal(socket);
    });
  });

  describe('isOpen', () => {
    describe('if socket is missing', () => {
      it('should return false', () => {
        expect(WSS.isOpen()).to.be.false;
      });
    });

    describe('if socket is not in open state', () => {
      it('should return false', () => {
        expect(WSS.isOpen({ readyState: 'CLOSED' })).to.be.false;
      });
    });

    describe('if socket is in open state', () => {
      it('should return false', () => {
        expect(WSS.isOpen({ readyState: WebSocket.OPEN })).to.be.true;
      });
    });
  });

  describe('makeSendToSocket', () => {
    it('should return a function', () => {
      expect(WSS.makeSendToSocket()).to.be.a('function');
    });

    describe('sendToSocket', () => {
      describe('if socket is open', () => {
        it('should call socket.send', () => {
          WSS.makeSendToSocket({})(socket);
          expect(socket.send.called).to.be.true;
        });

        it('should call socket.send with stringified payload', () => {
          WSS.makeSendToSocket({ a: 'a' })(socket);
          expect(socket.send.getCall(0).args[0]).to.equal('{"a":"a"}');
        });
      });

      describe('if socket is not open', () => {
        it('should not call socket.send', () => {
          socket.readyState = WebSocket.CONNECTING;
          WSS.makeSendToSocket({})(socket);
          expect(socket.send.notCalled).to.be.true;
        });
      });
    });
  });

  describe('removeClosedSockets', () => {
    describe('if socket array of user is empty', () => {
      it('should return', () => {
        wss.removeClosedSockets('id');
        expect(wss.sockets.id).to.be.undefined;
      });
    });

    describe('if socket array of user is not empty', () => {
      beforeEach(() => {
        wss.addSocket('id', { readyState: WebSocket.CONNECTING, on: p => p });
        wss.addSocket('id', { readyState: WebSocket.OPEN, on: p => p });
        wss.addSocket('id', { readyState: WebSocket.CLOSING, on: p => p });
        wss.addSocket('id', { readyState: WebSocket.CLOSED, on: p => p });
      });

      it('should remove the closed sockets', () => {
        wss.removeClosedSockets('id');

        expect(wss.sockets.id).to.have.lengthOf(3);
        expect(wss.sockets.id[0].readyState).to.equal(WebSocket.CONNECTING);
        expect(wss.sockets.id[1].readyState).to.equal(WebSocket.OPEN);
        expect(wss.sockets.id[2].readyState).to.equal(WebSocket.CLOSING);
      });
    });
  });

  describe('errorHandler', () => {
    describe('if no error occurred', () => {
      it('should not call debug', () => {
        WSS.errorHandler(null);

        expect(debug.notCalled).to.be.true;
      });
    });

    describe('if error occurred', () => {
      it('should call debug with error message', () => {
        WSS.errorHandler('error');

        expect(debug.getCall(0).args[0]).to.equal('Error on sending %O');
        expect(debug.getCall(0).args[1]).to.equal('error');
      });
    });
  });
});