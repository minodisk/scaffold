/*$ctx := .*/# /*.Title*/

/*.Description*/

## Models

/*range .Properties*/### /*.Title*/

/*.Description*/

/*range .Properties*/- `/*.Key*/`: /*.Description*/
  - Type: /*joinTypes .Schema.Type ", "*/
/*if eq .Type "array"*/  - Items:/*range .Items.Schemas*/
/*end*//*else if eq .Type "object"*/  - Schema:
/*else*/  - Example: `/*serialize .Example*/`
/*end*//*end*/
/*end*/

## APIs

/*range .Links*/### /*.Title*/

/*.Extras.description*/

/*if .Schema*//*range .Schema.Properties*/- `/*.Key*/`: /*.Extras.description*/
/*if eq .Type "array"*/  - Items:/*range .Items.Schemas*/
    - [/*.Title*/](#/*.Title*/)
/*end*//*else if eq .Type "object"*/  - Schema:
/*else*/  - Example: `/*serialize .Example*/`
/*end*//*end*//*end*/

```http:Request
/*.Method*/ /*.Href*/ HTTP/1.1/*range .ReqHeaders*/
/*.Key*/: /*.Value*//*end*/
/*if .ReqBody*/
/*.ReqBody*/
/*end*/```

```http:Response
HTTP/1.1 /*.ResStatusCode*/ /*.ResReasonPhrase*//*range .ReqHeaders*/
/*.Key*/: /*.Value*//*end*/
/*if .ResBody*/
/*.ResBody*/
/*end*/```

/*end*/
