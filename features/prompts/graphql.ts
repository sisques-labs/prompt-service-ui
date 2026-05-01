import { gql } from "@apollo/client/core";

const PROMPT_FIELDS = gql`
  fragment PromptFields on Prompt {
    id name slug content version tags createdAt updatedAt
  }
`;

export const FIND_BY_CRITERIA = gql`
  ${PROMPT_FIELDS}
  query FindByCriteria($criteria: BaseFindByCriteriaInput) {
    findByCriteria(criteria: $criteria) {
      items { ...PromptFields }
      total page perPage totalPages
    }
  }
`;

export const FIND_BY_ID = gql`
  ${PROMPT_FIELDS}
  query FindById($id: String!) {
    findById(id: $id) { ...PromptFields }
  }
`;

export const RENDER_PROMPT = gql`
  ${PROMPT_FIELDS}
  query RenderPrompt($input: RenderPromptRequestDto!) {
    renderPrompt(input: $input) { ...PromptFields }
  }
`;

export const CREATE_PROMPT = gql`
  mutation CreatePrompt($input: CreatePromptRequestDto!) {
    createPrompt(input: $input) { id success message }
  }
`;

export const UPDATE_PROMPT = gql`
  mutation UpdatePrompt($input: UpdatePromptRequestDto!) {
    updatePrompt(input: $input) { id success message }
  }
`;

export const DELETE_PROMPT = gql`
  mutation DeletePrompt($id: String!) {
    deletePrompt(id: $id) { id success message }
  }
`;
