<?php

// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Items Model for Voterapp2 Component.
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 *
 * @license    GNU/GPL
 */
class Voterapp2ModelMain extends JModel
{
    /**
     * Items data array.
     *
     * @var array
     */
    public $_data;

    /**
     * Constructor prepares for pagination.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Build and return the query.
     *
     * @return string SQL Query
     */
    public function _buildQuery()
    {
        $query = "  SELECT e.id as election_id , t.name as election_type ";
        $query .= " FROM `#__rt_election` as e ";
        $query .= " JOIN `#__rt_split_type` as t ON e.type = t.id ";
        $query .= " WHERE e.showElection=1 ";
        $query .= " ORDER BY e.election_date DESC ";
        $query .= " LIMIT 0 , 1 ";

        return $query;
    }

    /**
     * Retrieve, store, and returns Items data.
     *
     * @return array Items Data
     */
    public function getData()
    {

        $map_array = array(
          'Mayoral P & G'       => 'mayoral_p_g',
          'Presidential P & G'    => 'presidential_p_g',
          'DA/Controller P & G'   => 'da_controller_p_g',
          'Gubernatorial Primary'   => 'gubernatorial_primary',
          'Gubernatorial General'   => 'gubernatorial_general'
        );

        $db = &$this->_db;

        // if data hasn't already been obtained, load it
        if (empty($this->_data)) {

            //echo $election_query;die;
            $db->setQuery($this->_buildQuery());
            if ($db->query()) {
                $row_split = $db->loadAssoc();

                //Logic start from here to grab all fncky things
                if (isset($row_split['election_type']) && ! empty($row_split['election_type']) && isset($map_array [$row_split['election_type']])) {
                    //get valid splits for which ballots is upload. Not special one.
                    $ballot_query = "  SELECT b.sid , b.file_id , b.file_name , s.division ";
                    $ballot_query .= " FROM `#__rt_ballot_upload` AS b ";
                    $ballot_query .= " JOIN `#__rt_split` AS s ON s." . $map_array[$row_split['election_type']] . " = b.sid ";
                    $ballot_query .= " WHERE b.eid = " . $db->quote($row_split['election_id']) . " ";
                    $db->setQuery($ballot_query);
                    $normal_splits = array();
                    $normal = array();
                    $normal_data = array();
                    if ($db->query()) {
                        $normal = $db->loadObjectList();
                        foreach ($normal as $key=>$val) {
                            $normal_splits[$val->sid] = $val->sid;
                            $normal_data[$val->division] = $val;
                        }
                    }

                    $imp = "'" . implode("', '", $normal_splits) . "'";
                    if (! empty($imp)) {
                        $query_not_in = ' and sid not in ( ' . $imp . ' )';
                    }
                    //now handle special splits over here.
                    $updated_array = array();
                    $splits_in_election_query = " SELECT sid , file_name , file_id from `#__rt_ballot_upload` where eid = " . $db->quote($row_split['election_id']) . " " . $query_not_in;
                    $db->setQuery($splits_in_election_query);
                    if ($db->query()) {
                        $a = $db->loadObjectList();
                        foreach ($a as $key=>$val) {
                            $n_arr = explode('%', $val->sid);
                            if (count($n_arr) > 1) {
                                $val->sid = str_replace('^', '', $n_arr[0]);
                                //Select custom wards over here....
                                $special_div_query = " SELECT data , name from `#__rt_special_split` WHERE id = " . $db->quote($val->sid) . " LIMIT 0 , 1 ";

                                $db->setQuery($special_div_query);
                                if ($db->query()) {
                                    $special_split_data = $db->loadAssoc();
                                    if (isset($special_split_data['data'])) {
                                        $array  = base64_decode($special_split_data['data']);
                                        $decode = json_decode($array);

                                        for ($j=0; $j < count($decode); $j++) {
                                            $normal_data[$decode[$j]] = array(
                                              'sid'   => $special_split_data['name'],
                                              'file_id' => $val->file_id,
                                              'file_name' => $val->file_name,
                                              'division'  => $decode[$j],
                                              'special_bit'=> 1,
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            $this->_data = $normal_data;
        }

        return $this->_data;
    }
}
