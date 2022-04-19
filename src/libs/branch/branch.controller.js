const BranchModel = require('./branch.model');
const crypto = require('crypto');
const fs = require('fs');

exports.insert = (req, res) => {
    BranchModel.createBranch(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.editBranch = (req, res, next) => {
    let images = [];
    req.files.map(file => {
        images.push({
            branchId: req.params.branchId,
            path: `uploads/branch/${file.filename}`

        });
    })
    req.body.branchImages = images;
    BranchModel.editBranch(req.body, req.params.branchId)
        .then((result) => {
            next();
        }, err => {
            res.status(406).send(err);
        });

};
exports.updateBranchImages = (req, res) => {
    BranchModel.updateBranchImages(req.body)
        .then((result) => {
            res.status(201).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.getBranch = (req, res) => {
    BranchModel.getBranch(req.params.branchId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.getBranchDetails = (req, res) => {
    console.log("branch id controller", req.params.branchId)
    BranchModel.getBranchDetails(req.params.branchId, req.body)

        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};
exports.findAllBranch = (req, res) => {
    BranchModel.findAllBranch()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.findAllActiveBranch = (req, res) => {
    BranchModel.findAllActiveBranch()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllBranch = (req, res) => {
    BranchModel.listAllBranch(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllBranchFeedBacks = (req, res) => {
    BranchModel.listAllBranchFeedBacks(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listAllActiveBranch = (req, res) => {
    BranchModel.listAllActiveBranch()
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.checkRatingAlreadyExist = (req, res, next) => {
    req.body.userId = req.jwt.userId;
    BranchModel.checkRatingAlreadyExist(req.body)
        .then((result) => {
            if (result != null) {
                req.body.id = result.dataValues.id;
                next()
            } else {
                req.body.id = null;
                next();
            }
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateBranchRating = (req, res, next) => {
    BranchModel.updateBranchRating(req.body)
        .then((result) => {
            req.data = result;
            next()
        }, err => {
            res.status(406).send(err);
        });
};
exports.updateBranch = (req, res) => {
    BranchModel.updateBranch(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.checkTheUserIsAdmin = (req, res, next) => {
    BranchModel.checkTheUserIsAdmin(req.body.selectedUserId)
        .then((result) => {
            if (result != null) {
                console.log(result);
                req.body.userId = req.body.selectedUserId;
                let images = [];
                req.files.map(file => {
                    images.push({
                        path: `uploads/branch/${file.filename}`
                    });
                })
                req.body.branchImages = images;
                next();
            } else {
                req.files.map(file => {
                    fs.unlinkSync(`uploads/branch/${file.filename}`);
                })
                res.status(406).send({ "error": "Selected User Is not valid" });
            }

        }, err => {
            console.log(err);
            res.status(406).send(err);
        });
};
exports.deleteBranch = (req, res) => {
    BranchModel.deleteBranch(req.params.branchId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });

};













exports.addBranchNearestCategory = (req, res) => {
    BranchModel.addBranchNearestCategory(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.listBranchNearestCategory = (req, res) => {
    BranchModel.listBranchNearestCategory(req.params.branchId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deleteBranchNearestCategory = (req, res) => {
    BranchModel.deleteBranchNearestCategory(req.params.branchNearestCategoryId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.addBranchNearestItem = (req, res) => {
    req.body.image = `uploads/branch-nearest-item/${req.file.filename}`;
    BranchModel.addBranchNearestItem(req.body)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};
exports.deleteBranchNearestItem = (req, res) => {
    BranchModel.deleteBranchNearestItem(req.params.branchNearestItemId)
        .then((result) => {
            res.status(200).send(result);
        }, err => {
            res.status(406).send(err);
        });
};