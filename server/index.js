// note, io(<port>) will create a http server for you
const io = require('socket.io')(4000);

const arrUserInfo = [];

io.on('connection', (socket) => {
  socket.on( "USER_SIGN_UP", user => {
    const isExist = arrUserInfo.some( e => e.ten === user.ten );
    socket.peerId = user.peerId;
    if ( isExist ) {
      return socket.emit( "SIGN_UP_FAIL" );
    }
    arrUserInfo.push( user );
    socket.emit( "LIST_USER", arrUserInfo );
    socket.broadcast.emit( "NEW_USER", user );
  } )
  socket.on( "disconnect", () => {
    const index = arrUserInfo.findIndex( user => user.peerId === socket.peerId );
    arrUserInfo.splice( index, 1 );
    io.emit( "WHO_DISCONNECT", socket.peerId );
  } );
});