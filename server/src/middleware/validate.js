export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = source === "query" ? req.query : source === "params" ? req.params : req.body;
    const result = schema.safeParse(data);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors.map((e) => e.message).join(", ") });
    }
    req.validated = result.data;
    next();
  };
}
