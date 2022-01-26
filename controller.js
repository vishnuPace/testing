
const EmpModel = require('./emp_db');
const ComModel = require('./com_db');
const ObjectID = require("mongodb").ObjectID;
const req = require('express/lib/request');

exports.login = async (req, res) => {
    try {
        var req = req.body
        let find_data = {
            email: req.email,
            password: req.password
        }
        let data = await EmpModel.findOne(find_data).lean()
        if (data && data._id) {
            return res.send({ status: true, message: "login sucess", data })
        } else {
            return res.send({ status: true, message: "login failed", data })
        }
    } catch (error) {
        console.log("exports.login -> error", error)
        return res.send({ status: false, message: "process failed" })
    }
}
exports.update_employee = async (req, res) => {
    try {
        var req = req.body
        if (req['manager_id']) {
            if (req['_id'] && req['_id'] === req['manager_id']) {
                return res.send({ status: false, message: "You can't assign to you" })
            }
            let manager_data = await EmpModel.findOne({ _id: req['manager_id'], role: "manager", is_delete: false }).lean()
            if (!manager_data) {
                return res.send({ status: false, message: "Manager id params invalid" })
            }
        }
        if (req._id) {
            let find_data = { "_id": req._id }
            let update_data = req
            delete update_data._id
            await EmpModel.updateOne(find_data, update_data)
            let data = await EmpModel.findOne(find_data).lean()
            return res.send({ status: true, message: "update success", data })
        } else {
            if (!req.company_id) {
                return res.send({ status: false, message: "Company id params required" })
            }

            var newEmployee = new EmpModel(req);
            let data = await newEmployee.save()
            return res.send({ status: true, message: "data fetched", data })
        }
    } catch (error) {
        return res.send({ status: false, message: "process failed" })
    }
}

exports.create_frist_admin_employee = async (req, res) => {
    try {
        var update_data = {
            name: "admin",
            email: "admin@admin",
            password: "admin",
            role: "admin"
        }
        let find_data = { email: "admin@admin" }
        let udate = await EmpModel.updateOne(find_data, update_data, { new: true, upsert: true })
        console.log("exports.create_frist_admin_employee -> udate", udate)
        let data = await EmpModel.findOne(find_data).lean()
        return res.send({ status: true, message: "update sucess", data })
    } catch (error) {
        console.log("exports.create_frist_admin_employee -> error", error)
        return res.send({ status: false, message: "process failed" })
    }
}


exports.update_company = async (req, res) => {
    try {
        var req = req.body
        if (req._id) {
            let find_data = { "_id": req._id }
            let update_data = req
            delete update_data._id
            await ComModel.updateOne(find_data, update_data, { new: true })
            let data = await ComModel.findOne(find_data).lean()
            return res.send({ status: true, message: "update sucess", data })
        } else {
            var newCom = new ComModel(req);
            let data = await newCom.save()
            return res.send({ status: true, message: "data fetched", data })
        }
    } catch (error) {
        return res.send({ status: false, message: "process failed" })
    }
}

exports.get_employee = async (req, res) => {
    try {
        var request = req.body
        let page = req.page || 1
        let per_page = 10
        let match = {}
        if (request['company_id']) {
            match['company_id'] = ObjectID(request['company_id'])
        }
        if (request['e_code']) {
            match['ref'] = { $regex: new RegExp("^" + request['e_code'], "i") }
        }
        if (request['phone_number']) {
            match['phone_number'] = { $regex: new RegExp("^" + request['phone_number'], "i") }
        }
        console.log("exports.get_employee -> match", match)
        let pipeline = [
            {
                $match: match
            },
            {
                '$facet': {
                    metadata: [{ $count: "total" }, { $addFields: { page } }],
                    docs: [{ $skip: (((Number(page) - 1) * per_page) > 0) ? ((Number(page) - 1) * per_page) : 0 }, { $limit: per_page }]
                }
            }
        ]
        let record = await EmpModel.aggregate(pipeline)
        return res.send({ status: true, message: "data fetched", data: record })
    } catch (error) {
        console.log("exports.get_company -> error", error)
        return res.send({ status: false, message: "process failed", data: [] })
    }
}

exports.get_company = async (req, res) => {
    try {
        var req = req.body
        let page = req.page || 1
        let per_page = 10
        let pipeline = [
            {
                '$facet': {
                    metadata: [{ $count: "total" }, { $addFields: { page } }],
                    docs: [{ $skip: (((Number(page) - 1) * per_page) > 0) ? ((Number(page) - 1) * per_page) : 0 }, { $limit: per_page }]
                }
            }
        ]
        let record = await ComModel.aggregate(pipeline)
        return res.send({ status: true, message: "data fetched", data: record })
    } catch (error) {
        console.log("exports.get_company -> error", error)
        return res.send({ status: false, message: "process failed", data: [] })
    }
}


exports.get_subordinate = async (req, res) => {
    try {
        let request = req.body
        let match = {}
        if (request['company_id']) {
            match['company_id'] = ObjectID(request['company_id'])
        }
        if (request['employee_id']) {
            match['_id'] = ObjectID(request['employee_id'])
        }
        let pipeline = [
            {
                $match: match
            },
            {
                $lookup: {
                    from: "emp_dbs",
                    let: { c_id: '$company_id', e_id: '$_id' },
                    as: "co worker", // please consider subordinates
                    pipeline: [
                        {
                            $match: {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$company_id", "$$c_id"] },
                                            { $eq: ["$role", "employee"] },
                                            { $ne: ['$_id', "$$e_id"] }
                                        ]
                                }
                            }
                        },
                    ]
                }
            },
            {
                $lookup: {
                    from: "emp_dbs",
                    let: { c_id: '$company_id',m_id: '$manager_id' },
                    as: "reporting_manager",
                    pipeline: [
                        {
                            $match: {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$company_id", "$$c_id"] },
                                            { $eq: ["$role", "manager"] },
                                            { $eq: ['$_id', "$$m_id"] }
                                        ]
                                }
                            }
                        },
                    ]
                }
            },
        ]
        let record = await EmpModel.aggregate(pipeline)
        return res.send({ status: true, message: "data fetched", data: record })
    } catch (error) {
        console.log("exports.get_company -> error", error)
        return res.send({ status: false, message: "process failed", data: [] })
    }
}