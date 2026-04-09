update agent_capabilities
set handler_config = jsonb_build_object(
  'function', 'research-agent',
  'endpoint', '/functions/v1/research-agent'
)
where name = 'web_research';
