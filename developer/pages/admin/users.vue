<template>
  <b-container>
    <h3 class="mt-5">Users - {{ users.total }} in total</h3>
    <b-row>
      <b-col>
        <b-table show-empty striped hover stacked="sm" head-variant="dark" :items="users.users" :fields="fields" :per-page="users.limit">
          <template slot="picture" slot-scope="row">
            <b-img rounded="circle" width="50" height="50" :src="row.item.picture" ></b-img>
          </template>
          <template slot="name" slot-scope="row">
            <a :href="row.item.html_url">{{ row.item.name }}</a>
          </template>
          <template slot="email" slot-scope="row">
            <a href="mailto:"></a>
            <a :href="`mailto:${row.item.email}`">{{ row.item.email }}</a>
          </template>
          <template slot="created_at" slot-scope="row">
            {{ row.item.created_at | ago }}
          </template>
          <template slot="last_login" slot-scope="row">
            {{ row.item.last_login | ago }}
          </template>
          <template slot="actions" slot-scope="row">
            <b-button variant="primary" v-if="row.item.tokens.length" size="sm" @click.stop="row.toggleDetails">
              {{ row.detailsShowing ? 'Hide' : 'Show' }} tokens
            </b-button>
            <span v-else>No token</span>
          </template>
          <template slot="row-details" slot-scope="row">
            <b-card>
              <token v-for="token in row.item.tokens" :key="token.id" :token="token" />
            </b-card>
          </template>
          <template slot="empty">
            <div class="text-center">
              <img src="~/assets/loading.svg" alt="Loading..." width="80px" />
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-pagination :total-rows="users.total" :per-page="users.limit" v-model="page" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import gql from 'graphql-tag'
import token from '~/components/Token.vue'

export default {
  middleware: ['auth'],
  components: { token },
  data() {
    return {
      page: 1,
      fields: [{
        key: 'picture', label: ''
      }, {
        key:'name', tdClass: 'align-middle'
      }, {
        key: 'email', tdClass: 'align-middle'
      }, {
        key: 'last_login', tdClass: 'align-middle'
      }, {
        key: 'created_at', tdClass: 'align-middle'
      },{
        key: 'actions', tdClass: 'align-middle'
      }],
      users: {
        total: 0,
        users: []
      }
    }
  },
  apollo: {
    users: {
      query: gql`
        query($page: Int) {
          users(page: $page) {
            limit
            total
            users {
              created_at
              email
              html_url
              last_ip
              last_login
              name
              nickname
              picture
              user_id
              tokens {
                id
                createdAt
                stats {
                  date
                  hits
                }
              }
            }
          }
        }
      `,
      variables() {
        return { page: this.page }
      },
      update(data) {
        return JSON.parse(JSON.stringify(data.users))
      }
    }
  }
}
</script>
