export interface BaseResponse<T = any> {
    Success: boolean;
    Message: string;
    Object: T | null;
    Errors: string[] | null;
}

export interface PaginatedResponse<T = any> extends BaseResponse<T[]> {
    PageNumber: number;
    PageSize: number;
    TotalSize: number;
}
