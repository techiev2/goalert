import React, { useState } from 'react'
import p from 'prop-types'
import gql from 'graphql-tag'
import { useQuery, useMutation } from 'react-apollo'
import { fieldErrors, nonFieldErrors } from '../util/errutil'

import FormDialog from '../dialogs/FormDialog'
import ServiceForm from './ServiceForm'
import _ from 'lodash-es'

const query = gql`
  query service($id: ID!) {
    service(id: $id) {
      id
      name
      description
      ep: escalationPolicy {
        id
        name
      }
    }
  }
`

const mutation = gql`
  mutation updateService($input: UpdateServiceInput!) {
    updateService(input: $input)
  }
`

export default function ServiceEditDialog({ serviceID, onClose }) {
  const [value, setValue] = useState(null)
  const { data, ...dataStatus } = useQuery(query, {
    variables: { id: serviceID },
  })
  const [updateService, updateServiceStatus] = useMutation(mutation, {
    variables: { input: { ...value, id: serviceID } },
    onCompleted: onClose,
  })

  const defaults = {
    // default value is the service name & description with the ep.id
    ..._.chain(data)
      .get('service')
      .pick(['name', 'description'])
      .value(),
    escalationPolicyID: _.get(data, 'service.ep.id'),
  }

  const fieldErrs = fieldErrors(updateServiceStatus.error)

  return (
    <FormDialog
      title='Edit Service'
      loading={updateServiceStatus.loading || dataStatus.loading}
      errors={nonFieldErrors(updateServiceStatus.error).concat(
        nonFieldErrors(dataStatus.error),
      )}
      onClose={onClose}
      onSubmit={() => updateService()}
      form={
        <ServiceForm
          epRequired
          errors={fieldErrs}
          disabled={Boolean(
            updateServiceStatus.loading ||
              dataStatus.loading ||
              dataStatus.error,
          )}
          value={value || defaults}
          onChange={value => setValue(value)}
        />
      }
    />
  )
}

ServiceEditDialog.propTypes = {
  serviceID: p.string.isRequired,
  onClose: p.func,
}
