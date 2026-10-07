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
exports.BookController = exports.BookCopyController = void 0;
const common_1 = require("@nestjs/common");
const book_service_1 = require("./book.service");
const create_book_dto_1 = require("./create_book_dto");
const update_book_dto_1 = require("./update_book_dto");
let BookCopyController = class BookCopyController {
    bookService;
    constructor(bookService) {
        this.bookService = bookService;
    }
    findBookCopy(param_id) {
        return this.bookService.findBookCopy(Number(param_id));
    }
    updateBookCopy(param_id, new_book_copy_info) {
        return this.bookService.updateBookCopy(Number(param_id), new_book_copy_info);
    }
    removeBookCopy(param_id) {
        return this.bookService.removeBookCopy(Number(param_id));
    }
};
exports.BookCopyController = BookCopyController;
__decorate([
    (0, common_1.Get)(':param_id'),
    __param(0, (0, common_1.Param)('param_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookCopyController.prototype, "findBookCopy", null);
__decorate([
    (0, common_1.Patch)(':param_id'),
    __param(0, (0, common_1.Param)('param_id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_book_dto_1.UpdateBookCopyDto]),
    __metadata("design:returntype", void 0)
], BookCopyController.prototype, "updateBookCopy", null);
__decorate([
    (0, common_1.Delete)(':param_id'),
    __param(0, (0, common_1.Param)('param_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookCopyController.prototype, "removeBookCopy", null);
exports.BookCopyController = BookCopyController = __decorate([
    (0, common_1.Controller)('api/book-copy'),
    __metadata("design:paramtypes", [book_service_1.BookService])
], BookCopyController);
let BookController = class BookController {
    bookService;
    constructor(bookService) {
        this.bookService = bookService;
    }
    createBook(new_book_info) {
        return this.bookService.createBook(new_book_info);
    }
    findAll() {
        return this.bookService.findAll();
    }
    findOne(param_id) {
        return this.bookService.findOne(Number(param_id));
    }
    updateBook(param_id, new_book_info) {
        return this.bookService.updateBook(Number(param_id), new_book_info);
    }
    removeBook(param_id) {
        return this.bookService.removeBook(Number(param_id));
    }
};
exports.BookController = BookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_book_dto_1.CreateBookDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "createBook", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BookController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':param_id'),
    __param(0, (0, common_1.Param)('param_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':param_id'),
    __param(0, (0, common_1.Param)('param_id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_book_dto_1.UpdateBookDto]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "updateBook", null);
__decorate([
    (0, common_1.Delete)(':param_id'),
    __param(0, (0, common_1.Param)('param_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookController.prototype, "removeBook", null);
exports.BookController = BookController = __decorate([
    (0, common_1.Controller)('api/books'),
    __metadata("design:paramtypes", [book_service_1.BookService])
], BookController);
