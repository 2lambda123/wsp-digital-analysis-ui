import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  Box,
  FormHelperText,
  Stack
} from '@chakra-ui/core'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import sort from 'lodash/sortBy'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {createRegionalAnalysis} from 'lib/actions/analysis/regional'
import useInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'
import {
  activeOpportunityDataset,
  opportunityDatasets as selectOpportunityDatasets
} from 'lib/modules/opportunity-datasets/selectors'
import {versionToNumber} from 'lib/modules/r5-version/utils'

import Select from '../select'

// For react-select options
const getName = fpGet('name')
const getId = fpGet('_id')

const testContent = (s) => s && s.length > 0

const defaultCutoffs = [20, 30, 45, 60]
const defaultPercentiles = [5, 25, 50, 75, 95]

const parseStringAsArray = (s) =>
  Array.isArray(s) ? s : sort((s || '').split(',').map((s) => parseInt(s)))

const createTestArray = (min, max) => (sorted) =>
  sorted.every((s) => Number.isInteger(s)) &&
  sorted[0] >= min &&
  sorted[sorted.length - 1] <= max

const testCutoffs = createTestArray(5, 120)
const testPercentiles = createTestArray(1, 99)

export default function CreateRegional({
  isDisabled,
  profileRequest,
  projectId,
  variantIndex
}) {
  const {isOpen, onOpen, onClose} = useDisclosure()
  return (
    <>
      <Button
        isDisabled={isDisabled}
        onClick={onOpen}
        rightIcon='small-add'
        variantColor='green'
      >
        Regional analysis
      </Button>
      {isOpen && (
        <CreateModal
          onClose={onClose}
          profileRequest={profileRequest}
          projectId={projectId}
          variantIndex={variantIndex}
        />
      )}
    </>
  )
}

function CreateModal({onClose, profileRequest, projectId, variantIndex}) {
  const dispatch = useDispatch()
  const [isCreating, setIsCreating] = useState(false)
  const opportunityDatasets = useSelector(selectOpportunityDatasets)
  const selectedOpportunityDataset = useSelector(activeOpportunityDataset)
  const [destinationPointSets, setDestinationPointSets] = useState(
    selectedOpportunityDataset ? [selectedOpportunityDataset._id] : []
  )
  const workerVersion = get(profileRequest, 'workerVersion', '')
  const workerVersionHandlesMultipleDimensions =
    versionToNumber(workerVersion) > 50900 ||
    (workerVersion.length == 7 && workerVersion.indexOf('.') == -1)

  const nameInput = useInput({test: testContent, value: ''})

  function onChangeDestinationPointSets(datasets) {
    if (!datasets || datasets.length > 6) return
    setDestinationPointSets((datasets || []).map((d) => d._id))
  }

  const cutoffsInput = useInput({
    parse: parseStringAsArray,
    test: testCutoffs,
    value: get(profileRequest, 'cutoffsMinutes', defaultCutoffs)
  })

  const percentilesInput = useInput({
    parse: parseStringAsArray,
    test: testPercentiles,
    value: get(profileRequest, 'percentiles', defaultPercentiles)
  })

  function create() {
    setIsCreating(true)
    if (workerVersionHandlesMultipleDimensions) {
      dispatch(
        createRegionalAnalysis({
          ...profileRequest,
          cutoffsMinutes: cutoffsInput.value,
          destinationPointSetIds: destinationPointSets,
          name: nameInput.value,
          percentiles: percentilesInput.value,
          projectId,
          variantIndex
        })
      )
    } else {
      dispatch(
        createRegionalAnalysis({
          ...profileRequest,
          name: nameInput.value,
          projectId,
          variantIndex
        })
      )
    }
  }

  const createDisabled =
    nameInput.isInvalid ||
    cutoffsInput.isInvalid ||
    percentilesInput.isInvalid ||
    destinationPointSets.length < 1

  return (
    <Modal initialFocusRef={nameInput.ref} isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new regional analysis</ModalHeader>
        <ModalBody>
          <Stack mb={4} spacing={4}>
            <FormControl
              isDisabled={isCreating}
              mb={4}
              isRequired
              isInvalid={nameInput.isInvalid}
            >
              <FormLabel htmlFor={nameInput.id}>
                Regional analysis name
              </FormLabel>
              <Input {...nameInput} />
            </FormControl>

            <FormControl
              isDisabled={isCreating}
              isRequired
              isInvalid={
                destinationPointSets.length > 6 ||
                destinationPointSets.length === 0
              }
            >
              <FormLabel htmlFor='destinationPointSets'>
                Opportunity datasets
              </FormLabel>
              <Box>
                <Select
                  isClearable={false}
                  isDisabled={isCreating}
                  getOptionLabel={getName}
                  getOptionValue={getId}
                  inputId='destinationPointSets'
                  isMulti={workerVersionHandlesMultipleDimensions}
                  onChange={onChangeDestinationPointSets}
                  options={opportunityDatasets}
                  value={opportunityDatasets.filter((o) =>
                    destinationPointSets.includes(o._id)
                  )}
                />
              </Box>
              {workerVersionHandlesMultipleDimensions && (
                <FormHelperText>Select up to 6 datasets.</FormHelperText>
              )}
            </FormControl>
          </Stack>

          {workerVersionHandlesMultipleDimensions && (
            <Stack spacing={4}>
              <FormControl
                isDisabled={isCreating}
                isRequired
                isInvalid={cutoffsInput.isInvalid}
              >
                <FormLabel htmlFor={cutoffsInput.id}>Cutoff minutes</FormLabel>
                <Input
                  {...cutoffsInput}
                  value={cutoffsInput.value.join(', ')}
                />
              </FormControl>

              <FormControl
                isDisabled={isCreating}
                isRequired
                isInvalid={percentilesInput.isInvalid}
              >
                <FormLabel htmlFor={percentilesInput.id}>Percentiles</FormLabel>
                <Input
                  {...percentilesInput}
                  value={percentilesInput.value.join(', ')}
                />
              </FormControl>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            leftIcon='small-add'
            loadingText='Creating'
            isLoading={isCreating}
            isDisabled={createDisabled}
            mr={3}
            onClick={create}
            variantColor='green'
          >
            {message('common.create')}
          </Button>
          <Button isDisabled={isCreating} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
