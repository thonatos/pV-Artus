import { Context, Next } from '@artus/pipeline';

export default async function checkRole(
  ctx: Context,
  next: Next
): Promise<void> {
  const { data } = ctx.output;
  data.role = 'admin';
  await next();
}
