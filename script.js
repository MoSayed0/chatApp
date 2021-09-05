// validate group name and user name 
var userName;
var groupName; 
var senderID;
var channel;
var count = 0;
var chatMsg;
var chName;
var msgData;
const pusher = new Pusher("c1ecd9baa50bcd98a88f", { cluster: "eu" });

function validateScreen1(){
  groupName= document.getElementById("grpName").value;
  userName = document.getElementById("usrName").value;	
  Pusher.logToConsole = true;

  if (groupName.trim() == "" || groupName ==null){
    alert("Invalid group name !!");
	return false;
  }
  if (userName.trim() == "" || userName ==null){
    alert("Invalid user name !!");
	return false;
  }

 //console.log(uuidv4());
 ///localStorageSave(userName,groupName);
 senderID = uuidv4();
 adjustHeader();
 chName = document.getElementById("grpName").value;
 channel = pusher.subscribe(groupName);
 sendMessage("~$login"); // flag when user login 
 //localStorageSave(chName,1);
 channel.bind('my-event',  function(data) {
   //let dataRcd = JSON.stringify(data);
   let align = "left";
   let color = "lightblue";
   //console.log(data.xid);
   if (data == "~$login"){
     localStorageSave(chName,1);
   }
  
   else if (data == "~$logout"){
    localStorageSave(chName,-1);
  }
  else{
    if (data !== null && data !== msgData){
      chatAppend(data,align,color,"chat");   
    }
  }  
  });
  closeScreen();
  
}

function adjustHeader(){
  //let headerMsg = groupName + "<br> Welcome "+userName;
  document.getElementById("channelLabel").innerHTML = groupName;
  document.getElementById("userLabel").innerHTML = "Welcome "+userName + ",";
}

function showActiveUser(totalCount){
  document.getElementById("activeUsers").innerHTML = "Active users: "+totalCount;   

}

function localStorageSave(channelName, activeCount){
  var totalCount;
  //localStorage.setItem("userName", userName);
  //localStorage.setItem("userID", senderID);
  activeCountlabel = senderID + channelName + "ActiveCount";
  console.log(activeCountlabel);
  var count = localStorage.getItem(activeCountlabel);
  if (count == null){
    localStorage.setItem(activeCountlabel,activeCount);
    totalCount = activeCount;
  } 
  else{
    totalCount = activeCount + parseInt(count);
    localStorage.setItem(activeCountlabel,totalCount);
  }
  if (totalCount <= 0 ){
    totalCount = 1;
  }
  showActiveUser(totalCount);  
}

function getMD5(body){
    return CryptoJS.MD5(JSON.stringify(body));
}

function getAuthSignature(md5,timeStamp){
    return CryptoJS.HmacSHA256(`POST\n/apps/1261267/events\nauth_key=c1ecd9baa50bcd98a88f&auth_timestamp=${timeStamp}&auth_version=1.0&body_md5=${md5}`,"592cd44f1e4d2e5bfac5");
}

let sendMessage = async function(msg){
    console.log(msg);
    let body = {"xid":`${senderID}`,data:`${msg}`,name:"my-event",channel:chName,};
    console.log("Body : " + JSON.stringify(body));
    let timeStamp = Date.now()/1000;
    let md5=getMD5(body);
    let url =`https://cors.bridged.cc/https://api-eu.pusher.com/apps/1261267/events?body_md5=${md5}&auth_version=1.0&auth_key=c1ecd9baa50bcd98a88f&auth_timestamp=${timeStamp}&auth_signature=${getAuthSignature(md5,timeStamp)}`;
    let req = await fetch(url,{
        method:'POST',
        body:JSON.stringify(body),
        headers:{
            'Content-Type':'application/json'
        }
    }).catch(function (erro) {
      console.log(erro);
  });
}

function formMessage(){
  chatMsg = document.getElementById("message").value;
  //console.log(dataBody);
  document.getElementById("message").value = "";    
  let align = "right";
  let color = "lightgrey"; 
  msgData = "You: <br>" + chatMsg +"<br>" + getCurrentDateTime(); 
  console.log(msgData);
  chatAppend(msgData,align,color,"chat");
  msgData = userName +":<br>"+ chatMsg + "<br> " + getCurrentDateTime();   
  sendMessage(msgData);
}

function logout(){
   sendMessage("~$logout"); // flag when user logout   
   localStorage.clear();
   pusher.unsubscribe(chName);
    closeScreen();
}

function chatAppend(appendData, align, color,divName){
  let node = document.createElement("p"); 
  node.innerHTML = `${appendData}`;
  node.style.textAlign=align;
  if(color.trim !== ""){
    node.style.backgroundColor = color;
  }

  const element = document.getElementById(divName);
  element.appendChild(node);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getCurrentDateTime(){
  var currentdate = new Date(); 
  var datetime = " " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
  return datetime;
}

function closeScreen(){	
  let x = document.getElementById("login-screen");
  hideOrShow(x);
  x = document.getElementById("chat-box");
  hideOrShow(x);

}	
	
function hideOrShow(x) {
  if (x.style.display === "none") {
    x.style.display = "block";   
  } else {
    x.style.display = "none";
  }
  return true;
} 

var inactivityTime = function () {
    var time;
    window.onload = resetTimer;
    // DOM Events
    document.onmousemove = resetTimer;
    document.onkeydown = resetTimer;

    logout();

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logout, 15000)
        // 1000 milliseconds = 1 second
    }
};

/*
window.onload = function() {
  inactivityTime();
}
*/