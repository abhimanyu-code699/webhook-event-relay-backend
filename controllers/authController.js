const { tryCatch } = require('bullmq');
const prisma = require('../config/prismaClient');

exports.login = async(req,res) =>{
    try {
        const {name,email} = req.body;
        if(!name || !email){
            return res.status(404).json({
                message:'Name and email both are required' 
            })
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}