const mongoose=require('mongoose');
const {place,des}=require('./helper');
const Image=require('../models/image');

const db_url='just for builing the database : )';

mongoose.connect(db_url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log("Connected");
    })
    .catch((err)=>{
        console.log(err);
    })

const calc = array => array[Math.floor(Math.random() * array.length)];


const seedDB=async ()=>{
    await Image.deleteMany({});
    for(var i=0;i<50;i++)
    {
        const small=Math.floor(Math.random()*1000);
        const p=Math.floor(Math.random()*100)+100;
        const smallcamp=new Image({
            url:'https://source.unsplash.com/1600x900/?himalayas',
            name:`${calc(place)} ${calc(des)}`,
            details:'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        })
        await smallcamp.save();
    }
}


seedDB()
    .then(()=>{
        mongoose.connection.close();
    })