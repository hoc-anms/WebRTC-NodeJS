const socket = io( "https://webrtc-anms.herokuapp.com/" );

$( "#div-chat" ).hide();

let customConfig;

$.ajax( {
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "hoc-anms",
    secret: "48eb7b76-0750-11ea-9f74-0242ac110007",
    application: "default",
    room: "default",
    secure: 1
  },
  success: ( data, status ) => {
    customConfig = data.d;
    console.log( customConfig );
  },
  async: false
} );

socket.on( "LIST_USER", listUser => {
  $( "#div-chat" ).show();
  $( "#div-sign-up" ).hide();
  listUser.forEach( user => {
    const { ten, peerId } = user;
    $( "#ulUser" ).append( `<li id="${ peerId }"> ${ten}</li>` );
  });

  socket.on( "NEW_USER", user => {
    const { ten, peerId } = user;
    $( "#ulUser" ).append( `<li id="${ peerId }"> ${ten}</li>` );
  } );
} )

socket.on( "SIGN_UP_FAIL", () => {
  alert("Please choose another username!");
} );

socket.on( "WHO_DISCONNECT", peerId => {
  $( `#${peerId}` ).remove();
} );

const openStream = () => {
  const config = { "audio": true, "video": true };
  return navigator.mediaDevices.getUserMedia( config );
}

const playStream = ( idVideoTag, stream ) => {
  const video = document.getElementById( idVideoTag );
  video.srcObject = stream;
  video.play();
}

// openStream()
//   .then( stream => playStream ( "localStream", stream )  );

const peer = new Peer( { 
  "key": "peerjs", 
  "host": "https://peer-hocanms.herokuapp.com/", 
  "secure": true, 
  "port": 443,
  "config": customConfig
 } );

peer.on( "open", id => {
  $( "#my-peer" ).append( id )
  // Signup
  $( "#btnSignUp" ).click( () => {
    const userName = $( "#txtUserName" ).val();
    socket.emit( "USER_SIGN_UP", { "ten": userName, "peerId": id } );
  } );
} );

// Caller
$( "#btnCall" ).click( () => {
  const id = $("#remoteId").val();
  openStream()
    .then( stream => {
      playStream( "localStream", stream );
      const call = peer.call( id, stream );
      call.on( "stream", remoteStream => playStream( "remoteStream", remoteStream ) );
    } );
} );

// Receiver
peer.on( "call", call => {
  openStream()
  .then( stream => {
    call.answer( stream );
    playStream( "localStream", stream );
    call.on( "stream", remoteStream => playStream( "remoteStream", remoteStream ) );
  } );
} )

$( "#ulUser" ).on( "click", "li", function(){
  const id = $(this).attr("id");
  openStream()
  .then( stream => {
    playStream( "localStream", stream );
    const call = peer.call( id, stream );
    call.on( "stream", remoteStream => playStream( "remoteStream", remoteStream ) );
  } );
} );