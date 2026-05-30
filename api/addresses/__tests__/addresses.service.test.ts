import apiClient from '@/api/client'
import { addressesService } from '@/api/addresses/addresses.service'
import type {
  Address,
  AddressInput,
  AddressListResponse,
  AddressSearchResponse,
} from '@/api/addresses/addresses.types'

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockApiClient = apiClient as {
  get: jest.MockedFunction<typeof apiClient.get>
  post: jest.MockedFunction<typeof apiClient.post>
  put: jest.MockedFunction<typeof apiClient.put>
  patch: jest.MockedFunction<typeof apiClient.patch>
  delete: jest.MockedFunction<typeof apiClient.delete>
}

const buildAddress = (overrides: Partial<Address> = {}): Address => ({
  id: 'addr-uuid-123',
  formatted_address: 'Av. Corrientes 1234, Buenos Aires',
  street: 'Av. Corrientes',
  number: '1234',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  lat: -34.6037,
  lng: -58.3816,
  is_selected: false,
  ...overrides,
})

const buildAddressInput = (overrides: Partial<AddressInput> = {}): AddressInput => ({
  formatted_address: 'Av. Corrientes 1234, Buenos Aires',
  street: 'Av. Corrientes',
  number: '1234',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  lat: -34.6037,
  lng: -58.3816,
  ...overrides,
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('addressesService', () => {
  describe('search', () => {
    it('should call GET /addresses/search with the query param', async () => {
      const mockResponse: AddressSearchResponse = {
        results: [buildAddressInput()],
      }
      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      await addressesService.search('Corrientes 1234')

      expect(mockApiClient.get).toHaveBeenCalledWith('/addresses/search', {
        params: { q: 'Corrientes 1234' },
      })
    })

    it('should return the AddressSearchResponse from the API', async () => {
      const mockResponse: AddressSearchResponse = {
        results: [
          buildAddressInput({ street: 'Florida', number: '100' }),
          buildAddressInput({ street: 'Lavalle', number: '500' }),
        ],
      }
      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await addressesService.search('Buenos Aires')

      expect(result).toEqual(mockResponse)
    })

    it('should return an empty results array when no matches are found', async () => {
      const mockResponse: AddressSearchResponse = { results: [] }
      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await addressesService.search('nonexistent place xyz')

      expect(result).toEqual({ results: [] })
    })

    it('should call GET exactly once when searching', async () => {
      mockApiClient.get.mockResolvedValueOnce({ results: [] })

      await addressesService.search('test')

      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
    })

    it('should propagate network errors from search', async () => {
      const networkError = new Error('Network Error')
      mockApiClient.get.mockRejectedValueOnce(networkError)

      await expect(addressesService.search('Corrientes')).rejects.toThrow('Network Error')
    })

    it('should pass an empty string query param when q is an empty string', async () => {
      mockApiClient.get.mockResolvedValueOnce({ results: [] })

      await addressesService.search('')

      expect(mockApiClient.get).toHaveBeenCalledWith('/addresses/search', {
        params: { q: '' },
      })
    })
  })

  describe('list', () => {
    it('should call GET /addresses', async () => {
      const mockResponse: AddressListResponse = { addresses: [] }
      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      await addressesService.list()

      expect(mockApiClient.get).toHaveBeenCalledWith('/addresses')
    })

    it('should return the AddressListResponse from the API', async () => {
      const mockResponse: AddressListResponse = {
        addresses: [buildAddress(), buildAddress({ id: 'addr-uuid-456' })],
      }
      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await addressesService.list()

      expect(result).toEqual(mockResponse)
    })

    it('should return an empty addresses array when user has no addresses', async () => {
      const mockResponse: AddressListResponse = { addresses: [] }
      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await addressesService.list()

      expect(result).toEqual({ addresses: [] })
    })

    it('should call GET exactly once', async () => {
      mockApiClient.get.mockResolvedValueOnce({ addresses: [] })

      await addressesService.list()

      expect(mockApiClient.get).toHaveBeenCalledTimes(1)
    })

    it('should propagate errors from list', async () => {
      const serverError = new Error('Unauthorized')
      mockApiClient.get.mockRejectedValueOnce(serverError)

      await expect(addressesService.list()).rejects.toThrow('Unauthorized')
    })

    it('should return a list where one address is selected', async () => {
      const mockResponse: AddressListResponse = {
        addresses: [
          buildAddress({ id: 'addr-1', is_selected: true }),
          buildAddress({ id: 'addr-2', is_selected: false }),
        ],
      }
      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await addressesService.list()

      expect(result.addresses.find((a) => a.is_selected)).toBeDefined()
    })
  })

  describe('create', () => {
    it('should call POST /addresses with the address body', async () => {
      const input = buildAddressInput()
      const mockResponse = buildAddress()
      mockApiClient.post.mockResolvedValueOnce(mockResponse)

      await addressesService.create(input)

      expect(mockApiClient.post).toHaveBeenCalledWith('/addresses', input)
    })

    it('should return the created Address from the API', async () => {
      const input = buildAddressInput()
      const mockResponse = buildAddress({ id: 'new-addr-uuid' })
      mockApiClient.post.mockResolvedValueOnce(mockResponse)

      const result = await addressesService.create(input)

      expect(result).toEqual(mockResponse)
    })

    it('should include all AddressInput fields in the POST body', async () => {
      const input = buildAddressInput({
        street: 'San Martín',
        number: '999',
        city: 'Rosario',
        province: 'Santa Fe',
        lat: -32.9575,
        lng: -60.6394,
        formatted_address: 'San Martín 999, Rosario',
      })
      mockApiClient.post.mockResolvedValueOnce(buildAddress())

      await addressesService.create(input)

      expect(mockApiClient.post).toHaveBeenCalledWith('/addresses', expect.objectContaining({
        street: 'San Martín',
        number: '999',
        city: 'Rosario',
        province: 'Santa Fe',
        lat: -32.9575,
        lng: -60.6394,
      }))
    })

    it('should call POST exactly once', async () => {
      mockApiClient.post.mockResolvedValueOnce(buildAddress())

      await addressesService.create(buildAddressInput())

      expect(mockApiClient.post).toHaveBeenCalledTimes(1)
    })

    it('should propagate validation errors from create', async () => {
      const validationError = new Error('Validation failed')
      mockApiClient.post.mockRejectedValueOnce(validationError)

      await expect(addressesService.create(buildAddressInput())).rejects.toThrow('Validation failed')
    })
  })

  describe('update', () => {
    it('should call PUT /addresses/:id with the id in the URL and the body', async () => {
      const id = 'addr-uuid-123'
      const partialBody: Partial<AddressInput> = { number: '5678' }
      mockApiClient.put.mockResolvedValueOnce(buildAddress({ number: '5678' }))

      await addressesService.update(id, partialBody)

      expect(mockApiClient.put).toHaveBeenCalledWith(`/addresses/${id}`, partialBody)
    })

    it('should return the updated Address from the API', async () => {
      const id = 'addr-uuid-123'
      const updatedAddress = buildAddress({ number: '5678' })
      mockApiClient.put.mockResolvedValueOnce(updatedAddress)

      const result = await addressesService.update(id, { number: '5678' })

      expect(result).toEqual(updatedAddress)
    })

    it('should correctly interpolate the id into the URL path', async () => {
      const id = 'specific-addr-id-789'
      mockApiClient.put.mockResolvedValueOnce(buildAddress({ id }))

      await addressesService.update(id, {})

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/addresses/${id}`,
        expect.anything(),
      )
    })

    it('should support updating a full AddressInput body', async () => {
      const id = 'addr-uuid-full'
      const fullBody = buildAddressInput({ street: 'Belgrano', number: '42' })
      mockApiClient.put.mockResolvedValueOnce(buildAddress())

      await addressesService.update(id, fullBody)

      expect(mockApiClient.put).toHaveBeenCalledWith(`/addresses/${id}`, fullBody)
    })

    it('should call PUT exactly once', async () => {
      mockApiClient.put.mockResolvedValueOnce(buildAddress())

      await addressesService.update('addr-id', { city: 'Córdoba' })

      expect(mockApiClient.put).toHaveBeenCalledTimes(1)
    })

    it('should propagate errors from update', async () => {
      const notFoundError = new Error('Address not found')
      mockApiClient.put.mockRejectedValueOnce(notFoundError)

      await expect(addressesService.update('missing-id', {})).rejects.toThrow('Address not found')
    })
  })

  describe('delete', () => {
    it('should call DELETE /addresses/:id with the correct id in the URL', async () => {
      const id = 'addr-uuid-to-delete'
      mockApiClient.delete.mockResolvedValueOnce(undefined)

      await addressesService.delete(id)

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/addresses/${id}`)
    })

    it('should return void on successful deletion', async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined)

      const result = await addressesService.delete('addr-uuid-123')

      expect(result).toBeUndefined()
    })

    it('should correctly interpolate the id into the DELETE URL', async () => {
      const id = 'unique-delete-id-999'
      mockApiClient.delete.mockResolvedValueOnce(undefined)

      await addressesService.delete(id)

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/addresses/${id}`)
    })

    it('should call DELETE exactly once', async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined)

      await addressesService.delete('addr-id')

      expect(mockApiClient.delete).toHaveBeenCalledTimes(1)
    })

    it('should propagate errors from delete', async () => {
      const forbiddenError = new Error('Forbidden')
      mockApiClient.delete.mockRejectedValueOnce(forbiddenError)

      await expect(addressesService.delete('protected-addr-id')).rejects.toThrow('Forbidden')
    })

    it('should not call any other HTTP methods when deleting', async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined)

      await addressesService.delete('addr-id')

      expect(mockApiClient.get).not.toHaveBeenCalled()
      expect(mockApiClient.post).not.toHaveBeenCalled()
      expect(mockApiClient.put).not.toHaveBeenCalled()
    })
  })

  describe('select', () => {
    it('should call PUT /addresses/:id/select with the correct id in the URL', async () => {
      const id = 'addr-uuid-to-select'
      mockApiClient.put.mockResolvedValueOnce(buildAddress({ id, is_selected: true }))

      await addressesService.select(id)

      expect(mockApiClient.put).toHaveBeenCalledWith(`/addresses/${id}/select`)
    })

    it('should return the Address marked as selected', async () => {
      const id = 'addr-uuid-selected'
      const selectedAddress = buildAddress({ id, is_selected: true })
      mockApiClient.put.mockResolvedValueOnce(selectedAddress)

      const result = await addressesService.select(id)

      expect(result).toEqual(selectedAddress)
      expect(result.is_selected).toBe(true)
    })

    it('should correctly interpolate the id into the select URL path', async () => {
      const id = 'addr-select-path-check'
      mockApiClient.put.mockResolvedValueOnce(buildAddress({ id }))

      await addressesService.select(id)

      expect(mockApiClient.put).toHaveBeenCalledWith(`/addresses/${id}/select`)
    })

    it('should call PUT exactly once when selecting', async () => {
      mockApiClient.put.mockResolvedValueOnce(buildAddress())

      await addressesService.select('addr-id')

      expect(mockApiClient.put).toHaveBeenCalledTimes(1)
    })

    it('should propagate errors from select', async () => {
      const serverError = new Error('Internal Server Error')
      mockApiClient.put.mockRejectedValueOnce(serverError)

      await expect(addressesService.select('addr-id')).rejects.toThrow('Internal Server Error')
    })

    it('should not pass any body to the select endpoint', async () => {
      const id = 'addr-no-body'
      mockApiClient.put.mockResolvedValueOnce(buildAddress())

      await addressesService.select(id)

      expect(mockApiClient.put).toHaveBeenCalledWith(`/addresses/${id}/select`)
      expect(mockApiClient.put).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
      )
    })
  })
})
