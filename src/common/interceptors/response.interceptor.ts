import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  code: number;
  msg?: string;
  data: T;
  total?: number;
}

/**
 * 格式化日期为 `YYYY-MM-DD HH:mm`（东八区）
 */
function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dt = new Date(d.getTime() + 8 * 60 * 60 * 1000); // UTC → 北京时间
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())} ${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}`;
}

/**
 * 递归遍历数据，将所有 Date 转为字符串
 */
function transformDates(value: any): any {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return formatDate(value);
  if (Array.isArray(value)) return value.map(transformDates);
  if (typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      result[key] = transformDates(value[key]);
    }
    return result;
  }
  return value;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the controller already returns the proper format, pass through
        if (data && typeof data === 'object' && 'code' in data) {
          return data;
        }

        const response: ApiResponse<T> = {
          code: 200,
          data: data?.data !== undefined ? data.data : data,
        };

        if (data?.total !== undefined) {
          response.total = data.total;
        }

        if (data?.msg) {
          response.msg = data.msg;
        }

        // 统一格式化所有 Date 字段
        response.data = transformDates(response.data);

        return response;
      }),
    );
  }
}
