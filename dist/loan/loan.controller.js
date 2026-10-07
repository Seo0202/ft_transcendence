"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanController = void 0;
const common_1 = require("@nestjs/common");
const loan_service_1 = require("./loan.service");
let LoanController = class LoanController {
    loanService;
    constructor(loanService) {
        this.loanService = loanService;
    }
    createLoan(body) {
        return this.loanService.createLoan(body.user_id, body.book_copy_id);
    }
    findLoan(loan_id) {
        return this.loanService.findLoan(Number(loan_id));
    }
    returnLoan(loan_id) {
        return this.loanService.returnLoan(Number(loan_id));
    }
};
exports.LoanController = LoanController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoanController.prototype, "createLoan", null);
__decorate([
    (0, common_1.Get)(':loan_id'),
    __param(0, (0, common_1.Param)('loan_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoanController.prototype, "findLoan", null);
__decorate([
    (0, common_1.Patch)(':loan_id/return'),
    __param(0, (0, common_1.Param)('loan_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoanController.prototype, "returnLoan", null);
exports.LoanController = LoanController = __decorate([
    (0, common_1.Controller)('api/loans'),
    __metadata("design:paramtypes", [loan_service_1.LoanService])
], LoanController);
