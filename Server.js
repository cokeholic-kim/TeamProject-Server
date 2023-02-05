//common js 구문 import ---> require("모듈")
//express

const express = require("express");
const cors = require("cors");
const multer = require("multer")
const mysql = require("mysql");
const bcrypt = require('bcrypt'); //암호화 API
const saltRounds = 10;

//서버 생성
const app = express();

//포트번호
const port = 8080;

//브라우져의 cors이슈를 막기 위해 설정
app.use(cors());

// json형식 데이터를 처리하도록 설정
app.use(express.json());
// upload폴더 클라이언트에서 접근 가능하도록 설정
app.use("/upload",express.static("upload"));
//storage생성
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'upload/')
    },
    filename:(req,file,cb)=>{
        const newFilename = file.originalname
        cb(null,newFilename)
    }
})
//upload객체 생성하기
const upload = multer({ storage : storage });
//upload경로로 post 요청시 응답 구현하기
app.post("/upload",upload.single("file"),async (req,res)=>{
    res.send({
        imageURL:req.file.filename
    })
})

//mysql 연결 생성
const conn = mysql.createConnection({
    host:"customer-tutorial.cuukeoat8h7o.ap-northeast-1.rds.amazonaws.com",
    user:"admin",
    password:"",
    port:"3306",
    database:"TeamProject"
})
conn.connect();

// conn.query("쿼리문","콜백함수")

app.get('/place',(req,res)=>{
    conn.query("select * from City",(error,result,field)=>{
        if(error){
            res.send(error)
        }else{
            res.send(result)
        }
    })
})
//http://localhost:8080/special/1
//req{ params: {no:1}}
app.get("/place/:place",(req,res)=>{
    const {place} =req.params;
    conn.query(`select * from City where cityname = "${place}"`,(err,result,field)=>{
        if(err){
            res.send(err)
        }else{
            res.send(result)
        }
    })
})
//회원가입요청
app.post("/join",async (req,res)=>{
    //입력받은 비밀번호를 mytextpass로 저장
    const mytextpass = req.body.m_pass;
    let myPass = ""
    const {m_name,m_pass,m_phone,m_nickname,m_add1,m_add2,m_email} = req.body;

    // 빈문자열이 아니고 undefined가 아닐때
    if(mytextpass != '' && mytextpass != undefined){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            //hash메소드 호출되면 인자로 넣어준 비밀번호를 암호화 하여 콜백함수 안 hash로 돌려준다
            bcrypt.hash(mytextpass, salt, function(err, hash) {// hash는 암호화시켜서 리턴되는값.
                // Store hash in your password DB.
                myPass = hash;
                conn.query(`insert into member(m_name,m_pass,m_phone,m_nickname,m_address1,m_address2,m_email) 
                values( '${m_name}' , '${myPass}' , '${m_phone}' , '${m_nickname}' , '${m_add1}' , '${m_add2}' , '${m_email}' )`
                ,(err,result,fields)=>{
                    console.log(result);
                    res.send("등록되었습니다.")
                })
            
            });
        });
    }
    console.log(req.body)
})

app.listen(port,()=>{
    console.log("서버가 구동중입니다.")
})