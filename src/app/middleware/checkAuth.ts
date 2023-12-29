import { Context, Next } from '@artus/pipeline';

export default async function checkAuth(
  ctx: Context,
  next: Next
): Promise<void> {
  const { data } = ctx.output;
  data.auth = 'pass';
  await next();
}
