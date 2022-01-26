const express = require('express')
const app = require('express')()
var http = require('http');
const mongoose = require('mongoose')
let db_link = 'mongodb://127.0.0.1/testing'
const EmpModel = require('./emp_db');
const TestRoutes = require('./routes')

try {
    mongoose.connect(db_link).then(() => {
        console.log("db connected")
    }).catch((err) => {
        send_email_admin("Not Connected to Database ERROR! ")
        console.log("Not Connected to Database ERROR! ", err);
    });
    console.log("test");
} catch (err) {
    console.log("Not Connected to Database ERROR! 1");
    send_email_admin("Not Connected to Database ERROR! ")
};


var send_email_admin = async (msg) => {
    console.log(msg)
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
    extended: true, limit: '10mb'
}));

app.use(async (req, res, next) => {
    var vid = req.headers['vid']
    if (['/api/create_frist_admin_employee','/api/login'].includes(req.url)) {
        next()
    } else {
        if (!vid) {
            res.send({
                status: false,
                message: "Admin only can access this applications",
            })
            return res.end()
        }
        let find_data = { _id: vid, role: "admin" }
        let result = await EmpModel.find(find_data)
        if (result && !result.length) {
            res.send({
                status: false,
                message: "Admin only can access this application",
            })
            return res.end()
        }
        next()
    }
})

app.use('/api', TestRoutes);

const httpPort = 8000;
const server = http.createServer({}, app);
server.listen(httpPort, function () {
    console.log("Express server listening on port");
});