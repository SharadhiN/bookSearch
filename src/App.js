import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Typography,
  CardContent,
  CardMedia,
  capitalize
} from "@material-ui/core";
import { CircularProgress, LinearProgress } from "@mui/material";
import { makeStyles } from "@material-ui/styles";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";



const API = "https://gutendex.com/books";


const useStyles = makeStyles({
    bookArea: {
      paddingTop: "30px",
      paddingLeft: "15%",
      paddingRight: "15%",
      width: "100%"
    },
    bookImage: {
      height: "160px",
      width: "160px"
    },
    progress: {
      position: "fixed",
      top: "50%",
      left: "50%",
      marginTop: "-100px",
      marginLeft: "-100px"
    }
});


const App = () => {
    const classes = useStyles();

    // states for books Response data from the API
    const [bookData, setBookData] = useState();
    const [nextResults, setNextResults] = useState();
    const [searchTitleValue, setSearchTitleValue] = useState("");
    const [searchAuthorValue, setSearchAuthorValue] = useState("");


    // states for infinite scroll
    const [scrollData, setScrollData] = useState();
    const [hasMoreValue, setHasMoreValue] = useState(true);

    const handleSubmit = () => {
      console.log('Fetch Search API');
      let uri = API + '?search=' + searchTitleValue;
      uri = encodeURI(uri);
      fetchBooks(uri);
    }

    const handleTitleChange = (e) => {
      // create the uri with search = query%params and fetch search results
      setSearchTitleValue(e.target.value);
      // e.preventDefault();
      

      // ! CLIENT SIDE FILTERING

      // if (searchTitleValue.length > 0) {
      //   let temp = [ ...bookData ];
      //   // filter by title
      //   temp = temp.filter(each => (each.title).toLowerCase().includes(searchTitleValue.toLowerCase()));
      //   setScrollData(temp);
      //   // setBookData(temp);
      //   setHasMoreValue(false);
      // } else {
      //   // setBookData([]);
      //   setScrollData(bookData.slice(0, bookData.length + 20));
      //   setHasMoreValue(false);
      // }
    }
    const handleAuthorChange = (e) => {
      // e.preventDefault();
      setSearchAuthorValue(e.target.value);

      if (searchAuthorValue.length > 0) {
        // filter by author
        let temp = [ ...bookData ];
        temp = temp.filter(each => each.authors.some(author => author.name.toLowerCase().includes(searchAuthorValue.toLowerCase())));
        console.log(searchAuthorValue);
        console.log(temp);
        setScrollData(temp);
        setHasMoreValue(false);
      } else {
        setScrollData(bookData.slice(0, bookData.length + 20));
        setHasMoreValue(false);
      }
    }

    const fetchBooks = async (url) => {
        try {
          var response;
          if ( url ) {
            response = await axios.get(url);
          } else {
            response = await axios.get(API);
          }
          if ( response ) {
            console.log('Response received!', response.data);
            // call setBookData here
            const newData = response.data.results;
            setBookData(newData);
            setNextResults(response.data.next);

            // check "format" fields in each book to get image, audio info
            newData.forEach(book => {
                let formats = book.formats;
                let bookKeys = Object.keys(formats);
                // console.log(bookKeys);
                for (let each of bookKeys) {
                    // make the img url easily accessible
                    if ( each.includes('image/jpeg') ) {
                        book.imgUrl = book.formats[each];
                    }

                    // get the ebook url
                    if ( each.includes('-ebook') ) {
                      book.ebookUrl = book.formats[each];
                    }

                    //TODO: make the audio url easily accessible
                }
            });

            // set scroll data - set initial scroll range
            setScrollData(newData.slice(0, 20));
            setHasMoreValue(true);
          }
        } catch (axiosError) {
            console.log(axiosError);
            console.log('Error occurred while trying to fetch API data!');
        }
    };

    const loadMoreData = () => {
        // load more data here by increasing the scroll range
        try {
            fetchBooks(nextResults);
            // setScrollData(bookData.slice(0, scrollData.length + 20));
        } catch (err) {
            console.log(err);
        }
    };

    const lastRowHandler = () => {
        // check scroll length and available data length and load more if required.
        console.log('Loading more books');
        if ( scrollData.length < bookData.length ) {
            setHasMoreValue(true);
            loadMoreData();
        } else setHasMoreValue(false);

        // setHasMoreValue(true);
        // loadMoreData();
    };

    const renderBooks = (index) => {
      if ( !bookData || !bookData[index] ) return null;
        const { title, authors, imgUrl } = bookData[index];
        let authorsName = authors.map(a => a.name);


        return (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                <Card elevation={20}>
                    <CardContent align="center">
                        <Typography>{"Name: " + capitalize(`${title}`)}</Typography>
                        <Typography>{"Author: " + capitalize(`${authorsName.join(", ")}`)}</Typography>
                        <CardMedia>
                        <div
                            style={{
                            borderRadius: "50%",
                            backgroundColor: "#F2F5C8",
                            maxWidth: "90%"
                            }}
                        >
                            <img className={classes.bookImage} alt={title} src={imgUrl} />
                        </div>
                        </CardMedia>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    useEffect(() => {
        if ( !bookData || bookData.length == 0 ) {
          fetchBooks();
        }
    }, []);


    return(
        <div>
            <div>
              <input
                type="text"
                placeholder="Search for a book's title or author here"
                onChange={handleTitleChange}
                value={searchTitleValue}
                size="50"
              />
              <button onClick={handleSubmit}>Search
              </button>
              {/* <SearchField 
                placeholder='Search for a book title here'
                onEnter={handleTitleChange}
              /> */}
              {/* <input
                type="text"
                placeholder="Search for a book's author here"
                onChange={handleAuthorChange}
                value={searchAuthorValue}
                size="50"
              /> */}
            </div>
            {
                scrollData && scrollData.length > 0 ?
                (
                <InfiniteScroll
                    dataLength={scrollData.length}
                    next={lastRowHandler}
                    hasMore={hasMoreValue}
                    scrollThreshold={75}
                    height={10}
                    loader={<LinearProgress />}
                    style={{ overflow: "unset" }}
                    endMessage={
                      <p style={{ textAlign: 'center' }}>
                        <b>All books are loaded</b>
                      </p>
                    }
                >
                    <Grid container spacing={4} className={classes.bookArea}>
                       {scrollData.map((book, index) => renderBooks(index))}
                    </Grid>
                </InfiniteScroll>
                )
            :
            <CircularProgress
              color={"success"}
              className={classes.progress}
              size={200}
            />
        }
        </div>
    );

}

export default App;
