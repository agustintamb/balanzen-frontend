import { renderHook, waitFor } from '@testing-library/react-native'

import createWrapper from '@/__test-utils__/createWrapper'
import { addressesService } from '@/api/addresses/addresses.service'
import type { Address, AddressInput, AddressSearchResult } from '@/api/addresses/addresses.types'
import {
  useAddressSearch,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSelectAddress,
  useUpdateAddress,
} from '@/hooks/useAddresses'

jest.mock('@/api/addresses/addresses.service', () => ({
  addressesService: {
    search: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
  },
}))

const mockService = addressesService as {
  search: jest.MockedFunction<typeof addressesService.search>
  list: jest.MockedFunction<typeof addressesService.list>
  create: jest.MockedFunction<typeof addressesService.create>
  update: jest.MockedFunction<typeof addressesService.update>
  delete: jest.MockedFunction<typeof addressesService.delete>
  select: jest.MockedFunction<typeof addressesService.select>
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

const buildSearchResult = (overrides: Partial<AddressSearchResult> = {}): AddressSearchResult =>
  buildAddressInput(overrides)

afterEach(() => {
  jest.clearAllMocks()
})

describe('useAddressSearch', () => {
  describe('when query is shorter than 3 characters', () => {
    it('should not call search when q is an empty string', () => {
      renderHook(() => useAddressSearch(''), { wrapper: createWrapper().wrapper })

      expect(mockService.search).not.toHaveBeenCalled()
    })

    it('should not call search when q has 1 character', () => {
      renderHook(() => useAddressSearch('A'), { wrapper: createWrapper().wrapper })

      expect(mockService.search).not.toHaveBeenCalled()
    })

    it('should not call search when q has 2 characters', () => {
      renderHook(() => useAddressSearch('Av'), { wrapper: createWrapper().wrapper })

      expect(mockService.search).not.toHaveBeenCalled()
    })
  })

  describe('when query is 3 or more characters', () => {
    it('should call search with the query when q has 3 characters', async () => {
      mockService.search.mockResolvedValueOnce({
        results: [buildSearchResult()],
      })

      renderHook(() => useAddressSearch('Cor'), { wrapper: createWrapper().wrapper })

      await waitFor(() => {
        expect(mockService.search).toHaveBeenCalledWith('Cor')
      })
    })

    it('should call search with the full query string', async () => {
      mockService.search.mockResolvedValueOnce({
        results: [buildSearchResult()],
      })

      renderHook(() => useAddressSearch('Corrientes 1234'), { wrapper: createWrapper().wrapper })

      await waitFor(() => {
        expect(mockService.search).toHaveBeenCalledWith('Corrientes 1234')
      })
    })

    it('should return filtered results excluding entries with blank street, number, or city', async () => {
      mockService.search.mockResolvedValueOnce({
        results: [
          buildSearchResult({ street: 'Corrientes', number: '1234', city: 'Buenos Aires' }),
          buildSearchResult({ street: '', number: '1234', city: 'Buenos Aires' }),
          buildSearchResult({ street: 'Lavalle', number: '', city: 'Buenos Aires' }),
          buildSearchResult({ street: 'Florida', number: '100', city: '' }),
          buildSearchResult({ street: '   ', number: '100', city: 'Buenos Aires' }),
        ],
      })

      const { result } = renderHook(() => useAddressSearch('Corrientes'), {
        wrapper: createWrapper().wrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].street).toBe('Corrientes')
    })

    it('should return all results when all entries have valid street, number, and city', async () => {
      const validResults = [
        buildSearchResult({ street: 'Corrientes', number: '1234', city: 'Buenos Aires' }),
        buildSearchResult({ street: 'Lavalle', number: '500', city: 'Rosario' }),
      ]
      mockService.search.mockResolvedValueOnce({ results: validResults })

      const { result } = renderHook(() => useAddressSearch('Buenos'), {
        wrapper: createWrapper().wrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(2)
    })

    it('should return an empty array when all results have incomplete fields', async () => {
      mockService.search.mockResolvedValueOnce({
        results: [
          buildSearchResult({ street: '', number: '', city: '' }),
          buildSearchResult({ street: '  ', number: '  ', city: '  ' }),
        ],
      })

      const { result } = renderHook(() => useAddressSearch('incompleta'), {
        wrapper: createWrapper().wrapper,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(0)
    })

    it('should set isError to true when search rejects', async () => {
      mockService.search.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAddressSearch('Corrientes'), {
        wrapper: createWrapper().wrapper,
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.message).toBe('Network error')
    })
  })
})

describe('useAddresses', () => {
  it('should call list on mount', async () => {
    mockService.list.mockResolvedValueOnce({ addresses: [] })

    renderHook(() => useAddresses(), { wrapper: createWrapper().wrapper })

    await waitFor(() => {
      expect(mockService.list).toHaveBeenCalledTimes(1)
    })
  })

  it('should return the addresses array from the response', async () => {
    const addresses = [buildAddress({ id: 'addr-1' }), buildAddress({ id: 'addr-2' })]
    mockService.list.mockResolvedValueOnce({ addresses })

    const { result } = renderHook(() => useAddresses(), { wrapper: createWrapper().wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(addresses)
  })

  it('should return an empty array when the user has no addresses', async () => {
    mockService.list.mockResolvedValueOnce({ addresses: [] })

    const { result } = renderHook(() => useAddresses(), { wrapper: createWrapper().wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should return addresses where one is marked as selected', async () => {
    const addresses = [
      buildAddress({ id: 'addr-1', is_selected: true }),
      buildAddress({ id: 'addr-2', is_selected: false }),
    ]
    mockService.list.mockResolvedValueOnce({ addresses })

    const { result } = renderHook(() => useAddresses(), { wrapper: createWrapper().wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.find((a) => a.is_selected)).toBeDefined()
  })

  it('should set isError to true when list rejects', async () => {
    mockService.list.mockRejectedValueOnce(new Error('Unauthorized'))

    const { result } = renderHook(() => useAddresses(), { wrapper: createWrapper().wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Unauthorized')
  })
})

describe('useCreateAddress', () => {
  it('should be idle before mutate is called', () => {
    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper().wrapper })

    expect(result.current.isPending).toBe(false)
    expect(result.current.isIdle).toBe(true)
  })

  it('should call create with the address input body', async () => {
    const input = buildAddressInput()
    const createdAddress = buildAddress()
    mockService.create.mockResolvedValueOnce(createdAddress)

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate(input)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockService.create).toHaveBeenCalledTimes(1)
    expect(mockService.create.mock.calls[0][0]).toEqual(input)
  })

  it('should return the created address in data after success', async () => {
    const createdAddress = buildAddress({ id: 'new-addr-uuid' })
    mockService.create.mockResolvedValueOnce(createdAddress)

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate(buildAddressInput())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(createdAddress)
  })

  it('should set isError to true when create rejects', async () => {
    mockService.create.mockRejectedValueOnce(new Error('Validation failed'))

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate(buildAddressInput())

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Validation failed')
  })

  it('should set isPending to true while the mutation is in-flight', async () => {
    let resolveFn!: (value: Address) => void
    mockService.create.mockReturnValueOnce(
      new Promise<Address>((resolve) => {
        resolveFn = resolve
      }),
    )

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate(buildAddressInput())

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    resolveFn(buildAddress())

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })

  it('should call mutateAsync and resolve with the created address', async () => {
    const createdAddress = buildAddress({ id: 'async-addr-uuid' })
    mockService.create.mockResolvedValueOnce(createdAddress)

    const { result } = renderHook(() => useCreateAddress(), { wrapper: createWrapper().wrapper })

    const data = await result.current.mutateAsync(buildAddressInput())

    expect(data).toEqual(createdAddress)
  })
})

describe('useUpdateAddress', () => {
  it('should be idle before mutate is called', () => {
    const { result } = renderHook(() => useUpdateAddress(), { wrapper: createWrapper().wrapper })

    expect(result.current.isIdle).toBe(true)
  })

  it('should call update with the id and partial body', async () => {
    const id = 'addr-uuid-123'
    const partialBody: Partial<AddressInput> = { number: '5678' }
    mockService.update.mockResolvedValueOnce(buildAddress({ number: '5678' }))

    const { result } = renderHook(() => useUpdateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate({ id, body: partialBody })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockService.update).toHaveBeenCalledWith(id, partialBody)
  })

  it('should return the updated address in data after success', async () => {
    const updatedAddress = buildAddress({ number: '5678' })
    mockService.update.mockResolvedValueOnce(updatedAddress)

    const { result } = renderHook(() => useUpdateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate({ id: 'addr-uuid-123', body: { number: '5678' } })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(updatedAddress)
  })

  it('should set isError to true when update rejects', async () => {
    mockService.update.mockRejectedValueOnce(new Error('Address not found'))

    const { result } = renderHook(() => useUpdateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate({ id: 'missing-id', body: {} })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Address not found')
  })

  it('should set isPending to true while the mutation is in-flight', async () => {
    let resolveFn!: (value: Address) => void
    mockService.update.mockReturnValueOnce(
      new Promise<Address>((resolve) => {
        resolveFn = resolve
      }),
    )

    const { result } = renderHook(() => useUpdateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate({ id: 'addr-uuid-123', body: { city: 'Rosario' } })

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    resolveFn(buildAddress())

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })

  it('should support updating a full AddressInput body', async () => {
    const id = 'addr-full-update'
    const fullBody = buildAddressInput({ street: 'Belgrano', number: '42' })
    mockService.update.mockResolvedValueOnce(buildAddress())

    const { result } = renderHook(() => useUpdateAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate({ id, body: fullBody })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockService.update).toHaveBeenCalledWith(id, fullBody)
  })
})

describe('useDeleteAddress', () => {
  it('should be idle before mutate is called', () => {
    const { result } = renderHook(() => useDeleteAddress(), { wrapper: createWrapper().wrapper })

    expect(result.current.isIdle).toBe(true)
  })

  it('should call delete with the address id', async () => {
    const id = 'addr-to-delete'
    mockService.delete.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate(id)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockService.delete).toHaveBeenCalledTimes(1)
    expect(mockService.delete.mock.calls[0][0]).toBe(id)
  })

  it('should have undefined data after successful deletion', async () => {
    mockService.delete.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('addr-uuid-123')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeUndefined()
  })

  it('should set isError to true when delete rejects', async () => {
    mockService.delete.mockRejectedValueOnce(new Error('Forbidden'))

    const { result } = renderHook(() => useDeleteAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('protected-addr-id')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Forbidden')
  })

  it('should set isPending to true while the mutation is in-flight', async () => {
    let resolveFn!: (value: void) => void
    mockService.delete.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveFn = resolve
      }),
    )

    const { result } = renderHook(() => useDeleteAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('addr-uuid-123')

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    resolveFn()

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })

  it('should call delete exactly once per mutate call', async () => {
    mockService.delete.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('addr-id')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockService.delete).toHaveBeenCalledTimes(1)
  })
})

describe('useSelectAddress', () => {
  it('should be idle before mutate is called', () => {
    const { result } = renderHook(() => useSelectAddress(), { wrapper: createWrapper().wrapper })

    expect(result.current.isIdle).toBe(true)
  })

  it('should call select with the address id', async () => {
    const id = 'addr-to-select'
    mockService.select.mockResolvedValueOnce(buildAddress({ id, is_selected: true }))

    const { result } = renderHook(() => useSelectAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate(id)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockService.select).toHaveBeenCalledTimes(1)
    expect(mockService.select.mock.calls[0][0]).toBe(id)
  })

  it('should return the selected address with is_selected true after success', async () => {
    const selectedAddress = buildAddress({ id: 'addr-selected', is_selected: true })
    mockService.select.mockResolvedValueOnce(selectedAddress)

    const { result } = renderHook(() => useSelectAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('addr-selected')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(selectedAddress)
    expect(result.current.data?.is_selected).toBe(true)
  })

  it('should set isError to true when select rejects', async () => {
    mockService.select.mockRejectedValueOnce(new Error('Internal Server Error'))

    const { result } = renderHook(() => useSelectAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('addr-id')

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Internal Server Error')
  })

  it('should set isPending to true while the mutation is in-flight', async () => {
    let resolveFn!: (value: Address) => void
    mockService.select.mockReturnValueOnce(
      new Promise<Address>((resolve) => {
        resolveFn = resolve
      }),
    )

    const { result } = renderHook(() => useSelectAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('addr-uuid-123')

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    resolveFn(buildAddress({ is_selected: true }))

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })

  it('should call select exactly once per mutate call', async () => {
    mockService.select.mockResolvedValueOnce(buildAddress({ is_selected: true }))

    const { result } = renderHook(() => useSelectAddress(), { wrapper: createWrapper().wrapper })

    result.current.mutate('addr-id')

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockService.select).toHaveBeenCalledTimes(1)
  })

  it('should call mutateAsync and resolve with the selected address', async () => {
    const selectedAddress = buildAddress({ id: 'async-select-uuid', is_selected: true })
    mockService.select.mockResolvedValueOnce(selectedAddress)

    const { result } = renderHook(() => useSelectAddress(), { wrapper: createWrapper().wrapper })

    const data = await result.current.mutateAsync('async-select-uuid')

    expect(data).toEqual(selectedAddress)
  })
})
