/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const gif = /* GraphQL */ `query Gif($pics: [String!]!, $delayCentisecs: Int!, $w: Int!, $h: Int!) {
  gif(pics: $pics, delayCentisecs: $delayCentisecs, w: $w, h: $h)
}
` as GeneratedQuery<APITypes.GifQueryVariables, APITypes.GifQuery>;
