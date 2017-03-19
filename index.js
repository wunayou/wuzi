/**
 * Created by wunayou on 2017/3/14.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
var playersID=[];
const players = {} // sid和socket对象映射关系 id:socket
const relations = {} // 每个玩家和对手的对应关系  id1:id2   id2:id1
io.sockets.on('connection', function(socket) {
    const sid = socket.id;
    playersID.push(sid);
    players[sid] = socket;
    // console.log(players[sid]);
    // 其他用户链接主机
    socket.on('link', function(d) {
        const link = JSON.parse(d)
        relations[link.target] = link.sid // sid 主动发起连接的主机
        relations[link.sid] = link.target // target 被连接主机
        for (let value of playersID)
            {
                if (value == link.target) {
                    players[link.sid].emit('linkOK', 'linkOK')
                    players[link.target].emit('linked', 'linked')
                    return;
                }
            }
         players[socket.id].emit('linkerror', 'linkerror');
    });
    socket.on('clickmsg', function(d) {
        const data = JSON.parse(d)
        // 查询对手socket 并返回信息
        players[relations[socket.id]].emit('tick-back', d)
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});