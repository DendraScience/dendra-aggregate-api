/**
 * Tests for build service
 */

describe('Service /builds', function () {
  const cleanup = async () => {
    const coll = app.get('databases').nedb.db

    await new Promise((resolve, reject) => {
      coll.builds.remove({}, {
        multi: true
      }, (err, numRemoved) => err ? reject(err) : resolve(numRemoved))
    })
  }

  before(async function () {
    await cleanup()
  })

  describe('#create()', function () {
    it('should create without error', function () {
      return guest.service('/builds').create({
        _id: 'aaa-bbb-ccc',
        params: {
          some_param: 'some_param_value'
        },
        spec: {
          some_spec: 'some_spec_value'
        }
      }).then(doc => {
        expect(doc).to.have.property('_id', 'aaa-bbb-ccc')
        expect(doc).to.have.nested.property('params.some_param', 'some_param_value')
        expect(doc).to.have.nested.property('spec.some_spec', 'some_spec_value')
      })
    })
  })

  describe('#get()', function () {
    it('should get without error', function () {
      return guest.service('/builds').get('aaa-bbb-ccc').then(doc => {
        expect(doc).to.have.property('_id', 'aaa-bbb-ccc')
        expect(doc).to.have.nested.property('params.some_param', 'some_param_value')
        expect(doc).to.have.nested.property('spec.some_spec', 'some_spec_value')
      })
    })
  })

  describe('#find()', function () {
    it('should find without error', function () {
      return guest.service('/builds').find({}).then(res => {
        expect(res).to.have.property('data').lengthOf(1)
      })
    })
  })

  describe('#remove()', function () {
    it('should remove without error', function () {
      return guest.service('/builds').remove('aaa-bbb-ccc').then(doc => {
        expect(doc).to.have.property('_id')
      })
    })
  })
})
