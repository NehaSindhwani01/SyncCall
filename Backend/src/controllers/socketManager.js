import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server)=>{
    const io = new Server(server , {
        cors : {
            origin : "*",
            methods : ["GET" , "POST"],
            allowedHeaders : ["*"],
            credentials : true
        }
    });

    io.on("connection" , (socket)=>{

        //User joins a room (or call)
        socket.on("join-call" , (path)=>{
            if(connections[path] == undefined){
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date()

            //Inform everyone else in the room about the new user joined:
            for(let a = 0 ; a < connections[path].length ; i++){
                io.to(connections[path][a]).emit("user-joined" , socket.id)
            }
            //If room already had messages, send them to the new user: the new user receives old messages in room
            if(messages[path] !== undefined){
                for(let a = 0 ; a < messages[path].length ; i++){
                    io.to(socket.id).emit("chat-message" , 
                        messages[path][a]['data'],
                        messages[path][a]['sender'],
                        message[path][a]['socket-id-sender']
                    )
                }
            }
    
        })

        //WebRTC "signal" passing: One user sends "signal" data to another user directly (via server).
        socket.on("signal" , (toId , message)=>{
            io.to(toId).emit("signal" , socket.id , message)
        })

        //Chat Message Handling
        socket.on("chat-message", (data, sender) => {
            //find room from which it belong
            const [matchingRoom, found] = Object.entries(connections).reduce(
                ([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true]; //if found then return this
                    }
                    return [room, isFound];  //else return which it already have
                },
                ['', false] //initial state
            );

            //if found then send msg to all peoples in room
            if (found) {
                if(messages[matchingRoom] == undefined){
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({'sender' : sender , "data" : data , "socket-id-sender" : socket.id})
                console.log("message" , key , ":" , sender , data)

                connections[matchingRoom].forEach((elem)=>{
                    io.to(elem).emit("chat-message" , data , sender , socket.id)
                })
            }
        });


        socket.on("disconnect" , ()=>{
            var diffTime = Math.abs(timeOnline[socket.id] - new Date()) //calculate time spent
            var key
            for(const[k , v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                for(let a = 0 ; a < v.length ; i++){
                    if(v[a] == socket.id){
                        key = k
                        for(let a = 0 ; a < connectToSocket[key].length ; a++){
                            io.to(connections[key][a]).emit("user-left" , socket.id)
                        }
                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index , 1)

                        if(connections[key].length == 0){
                            delete connections[key]
                        }
                    }
                }
            }
        })
    })
    return io;
}

