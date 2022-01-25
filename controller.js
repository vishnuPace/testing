
const EmpModel = require('./emp_db');
const ComModel = require('./com_db');
const ObjectID = require("mongodb").ObjectID;

exports.update_employee = async (req, res) => {
    try {
        var req = req.body

        if (req._id) {
            let find_data = { "_id": req._id }
            let update_data = req
            delete update_data._id
            await EmpModel.updateOne(find_data, update_data)
            let data = await EmpModel.findOne(find_data).lean()
            return res.send({ status: true, message: "update sucess", data })
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
        var req = req.body
        var newEmployee = new EmpModel(req);
        let data = await newEmployee.save()
        return res.send({ status: true, message: "data fetched", data })
    } catch (error) {
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
        var req = req.body
        let page = req.page || 1
        let per_page = 10
        let match = {}
        if (req['company_id']) {
            match['company_id'] = ObjectID(req['company_id'])
        }
        if (req['ref']) {
            match['ref'] = { $regex: new RegExp("^" + requests['ref'], "i") }
        }
        if (req['phone_number']) {
            match['phone_number'] = { $regex: new RegExp("^" + requests['phone_number'], "i") }
        }
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
