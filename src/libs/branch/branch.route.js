const BranchController = require('./branch.controller');
const BranchModel = require('./branch.model');
const PermissionMiddleware = require('../../middleware/auth.permission');
const ValidationMiddleware = require('../../middleware/auth.validation'); 
const NORMAL_USER = require('../../configs/env').permissionLevels.NORMAL_USER;


exports.branchRoutes = function (app) {
    app.post('/branch', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchModel.uploadBranchImage,
        BranchController.checkTheUserIsAdmin,
        BranchController.insert
    ]);
    app.put('/branch/:branchId', [ 
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchModel.uploadBranchImage,
        BranchController.checkTheUserIsAdmin,
        BranchController.editBranch,
        BranchController.updateBranchImages
    ]);
    app.get('/branch/:branchId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.getBranch
    ]);
    app.post('/api/branch/:branchId', [ 
        BranchController.getBranchDetails
    ]);
    app.get('/branch', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.findAllBranch
    ]);
    app.get('/active-branch', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.findAllActiveBranch
    ]);
    app.post('/list-branch', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.listAllBranch
    ]);
    app.post('/list-branch-feedbacks', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.listAllBranchFeedBacks
    ]);
    app.delete('/branch/:branchId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.deleteBranch
    ]);
    app.get('/api/list-branch', [
        BranchController.listAllActiveBranch
    ]);
    app.post('/api/add-rating', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(NORMAL_USER),
        BranchController.checkRatingAlreadyExist,
        BranchController.updateBranchRating,
        BranchController.updateBranch,
    ]);












    
    app.post('/branch-nearest-category', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.addBranchNearestCategory
    ]);
    app.get('/list-branch-nearest-category/:branchId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.listBranchNearestCategory
    ]);
    app.delete('/branch-nearest-category/:branchNearestCategoryId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.deleteBranchNearestCategory
    ]);
    app.post('/branch-nearest-item', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchModel.uploadBranchNearestItemImage,
        BranchController.addBranchNearestItem
    ]);
    app.delete('/branch-nearest-item/:branchNearestItemId', [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySuperAdminCanDoThisAction,
        BranchController.deleteBranchNearestItem
    ]);
};