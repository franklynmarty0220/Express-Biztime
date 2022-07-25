const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../express');
const db = require('../db');


let router = new express.Router();

router.get('/', async  (req, res, next) =>{
    try {
        const result = await db.query(`SELECT * FROM companies ORDER BY name`);
        return res.json({companies: result.rows})
    }catch(err){
        next(err);
    }
})

router.get('/:code', async (req, res, next) =>{
    try {
        let code = req.params.code;
        const result = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);

        if (result.rows.length === 0) {
            throw new ExpressError (`No such company ${code}`, 404)
        }
    }catch(err){
        return next(err)
    }
})

router.post('/', async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let code =slugify(name, {lower:true})

        const result =await db.query(`INSERT INTO companies(code,name,description) 
        VALUES ($1,$2,$3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({company: result.rows[0]})
    } catch(err){
        return next(err)
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let {code} = req.params;

        const cResult = await db.query(`UPDATE company SET name = $1, description = $2 
        WHERE code = $3 RETURNING code, name, description`[name, description, code]); 

        const iResult = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code])

        if (cResult.rows.length === 0) {
            throw new ExpressError (`No such company ${code}`, 404)
        }

        const comp = cResult.rows[0]
        const inv = iResult.rows[0]
        comp.inv = inv.maps(inv => inv.id);
        return res.json({company: comp });

       
    }catch(err){
        return next(err);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        let {code} = req.params;

        const result = await db.query(`DELETE FROM COMPANIES WHERE code=$1 RETURNING code
        `,[code])

        if (result.rows.length === 0) {
            throw new ExpressError (`No such company ${code}`, 404)
        }else {
            return res.json({msg: "DELETED"})
        }
    }catch(err){
        return next(err);
    }
})

module.exports = router;