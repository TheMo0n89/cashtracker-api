"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryGroupDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_category_group_dto_1 = require("./create-category-group.dto");
class UpdateCategoryGroupDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_category_group_dto_1.CreateCategoryGroupDto, ['type'])) {
}
exports.UpdateCategoryGroupDto = UpdateCategoryGroupDto;
//# sourceMappingURL=update-category-group.dto.js.map